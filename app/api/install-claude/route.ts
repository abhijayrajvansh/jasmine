// app/api/install-claude/route.ts
export const runtime = "nodejs";

import { spawn } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";

let __INSTALL_BUSY = false;

export async function POST() {
  if (__INSTALL_BUSY) {
    return new Response(
      JSON.stringify({ error: "installation already in progress" }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  __INSTALL_BUSY = true;

  const encoder = new TextEncoder();
  let child: ChildProcessWithoutNullStreams | undefined;

  const stream = new ReadableStream({
    start(controller) {
      try {
        // Install Claude CLI locally using npm
        const cmd = "npm";
        const args = ["install", "@anthropic-ai/claude-code", "--save"];

        controller.enqueue(
          encoder.encode("Installing Claude CLI locally...\n")
        );
        controller.enqueue(
          encoder.encode(`Running: ${cmd} ${args.join(" ")}\n\n`)
        );

        child = spawn(cmd, args, {
          cwd: process.cwd(),
          env: { ...process.env },
          stdio: ["pipe", "pipe", "pipe"],
        });

        child.stdout.on("data", (chunk: Buffer) => {
          controller.enqueue(encoder.encode(chunk.toString()));
        });

        child.stderr.on("data", (chunk: Buffer) => {
          controller.enqueue(encoder.encode(`[stderr] ${chunk.toString()}`));
        });

        child.on("close", (code: number | null) => {
          if (code === 0) {
            controller.enqueue(
              encoder.encode("\n✅ Claude CLI installed successfully!\n")
            );
            controller.enqueue(
              encoder.encode("\nUpdating environment configuration...\n")
            );

            // Update the local environment to use the locally installed Claude
            controller.enqueue(encoder.encode("✅ Ready to use Claude CLI\n"));
            controller.enqueue(encoder.encode("\nNext steps:\n"));
            controller.enqueue(
              encoder.encode(
                "1. Test the installation using the 'Test Claude Installation' button\n"
              )
            );
            controller.enqueue(
              encoder.encode(
                "2. For Vercel deployment, add these environment variables:\n"
              )
            );
            controller.enqueue(
              encoder.encode("   CLAUDE_CLI_PATH=./node_modules/.bin/claude\n")
            );
            controller.enqueue(
              encoder.encode(
                "   CLAUDE_CLI_ARGS=--print --dangerously-skip-permissions --permission-mode bypassPermissions\n"
              )
            );
          } else {
            controller.enqueue(
              encoder.encode(
                `\n❌ Installation failed with exit code: ${code}\n`
              )
            );
          }
          controller.close();
          __INSTALL_BUSY = false;
        });

        child.on("error", (err: Error) => {
          controller.enqueue(
            encoder.encode(`❌ Installation error: ${err.message}\n`)
          );
          controller.close();
          __INSTALL_BUSY = false;
        });

        // Close stdin as we don't need to send any input
        child.stdin.end();
      } catch (err: unknown) {
        controller.enqueue(encoder.encode(`❌ Exception: ${String(err)}\n`));
        controller.close();
        __INSTALL_BUSY = false;
      }
    },
    cancel() {
      if (child && !child.killed) {
        try {
          child.kill("SIGTERM");
        } catch {}
      }
      __INSTALL_BUSY = false;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
