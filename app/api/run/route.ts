// app/api/run/route.ts
export const runtime = "nodejs"; // ensures Node runtime so child_process works

import { spawn } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";

type RunRequestBody = { 
  prompt?: string;
  workingDirectory?: string;
  githubRepo?: string;
  branch?: string;
};

let __LOCAL_RUN_BUSY = false; // simple local guard (module scoped)

export async function POST(req: Request) {
  const body: RunRequestBody = await req.json().catch(() => ({}));
  const prompt = (body.prompt ?? "").toString();
  const workingDirectory = (body.workingDirectory ?? process.cwd()).toString();
  const githubRepo = (body.githubRepo ?? "").toString();
  const branch = (body.branch ?? "main").toString();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (__LOCAL_RUN_BUSY) {
    return new Response(
      JSON.stringify({ error: "another run is in progress" }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  __LOCAL_RUN_BUSY = true;

  const cmd = process.env.CLAUDE_CLI_PATH || "claude-code";
  const baseArgs = (process.env.CLAUDE_CLI_ARGS || "--completion")
    .split(" ")
    .filter(Boolean);

  // Add working directory argument if specified and different from current
  const args = [...baseArgs];
  if (workingDirectory && workingDirectory !== process.cwd()) {
    args.push("--add-dir", workingDirectory);
  }

  const encoder = new TextEncoder();
  let child: ChildProcessWithoutNullStreams | undefined;

  const stream = new ReadableStream({
    start(controller) {
      try {
        // Create enhanced prompt with configuration context
        let enhancedPrompt = "";
        
        if (workingDirectory) {
          enhancedPrompt += `Working Directory: ${workingDirectory}\n`;
        }
        
        if (githubRepo) {
          enhancedPrompt += `GitHub Repository: ${githubRepo}\n`;
        }
        
        if (branch && branch !== "main") {
          enhancedPrompt += `Branch: ${branch}\n`;
        }
        
        if (enhancedPrompt) {
          enhancedPrompt += "\n";
        }
        
        enhancedPrompt += prompt;

        child = spawn(cmd, args, {
          cwd: workingDirectory || process.cwd(),
          env: { ...process.env },
          stdio: ["pipe", "pipe", "pipe"],
        });

        child.stdout.on("data", (chunk: Buffer) => {
          controller.enqueue(encoder.encode(chunk.toString()));
        });

        child.stderr.on("data", (chunk: Buffer) => {
          controller.enqueue(encoder.encode("[stderr] " + chunk.toString()));
        });

        child.on("close", (code: number | null) => {
          controller.enqueue(encoder.encode(`\n[exit:${code}]\n`));
          controller.close();
          __LOCAL_RUN_BUSY = false;
        });

        child.on("error", (err: Error) => {
          controller.enqueue(encoder.encode(`[error] ${err.message}\n`));
          controller.close();
          __LOCAL_RUN_BUSY = false;
        });

        // feed enhanced prompt to stdin (many CLIs accept prompt via stdin)
        child.stdin.write(enhancedPrompt + "\n");
        child.stdin.end();
      } catch (err: unknown) {
        controller.enqueue(encoder.encode(`[exception] ${String(err)}\n`));
        controller.close();
        __LOCAL_RUN_BUSY = false;
      }
    },
    cancel() {
      if (child && !child.killed) {
        try {
          child.kill("SIGTERM");
        } catch {}
      }
      __LOCAL_RUN_BUSY = false;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
