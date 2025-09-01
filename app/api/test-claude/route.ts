// app/api/test-claude/route.ts
export const runtime = "nodejs";

import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export async function POST(): Promise<Response> {
  try {
    // Check if Claude is installed locally
    const localClaudePath = path.join(
      process.cwd(),
      "node_modules",
      ".bin",
      "claude"
    );

    let claudePath = "claude"; // Default to global
    try {
      await fs.access(localClaudePath);
      claudePath = localClaudePath;
    } catch {
      // Local installation not found, try global
    }

    return new Promise<Response>((resolve) => {
      const child = spawn(claudePath, ["--version"], {
        cwd: process.cwd(),
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";

      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });

      child.on("close", (code: number | null) => {
        let result = "";

        if (code === 0) {
          result += `✅ Claude CLI is working!\n`;
          result += `Path: ${claudePath}\n`;
          result += `Version: ${output.trim()}\n\n`;
          result += `Configuration for Vercel:\n`;
          result += `CLAUDE_CLI_PATH=${
            claudePath === localClaudePath
              ? "./node_modules/.bin/claude"
              : "claude"
          }\n`;
          result += `CLAUDE_CLI_ARGS=--print --dangerously-skip-permissions --permission-mode bypassPermissions\n`;
        } else {
          result += `❌ Claude CLI test failed (exit code: ${code})\n`;
          if (errorOutput) {
            result += `Error: ${errorOutput}\n`;
          }
          result += `\nTry installing Claude CLI first using the installation button above.\n`;
        }

        resolve(
          new Response(result, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
            },
          })
        );
      });

      child.on("error", (err: Error) => {
        const result = `❌ Claude CLI not found or error occurred: ${err.message}\n\nTry installing Claude CLI first using the installation button above.\n`;
        resolve(
          new Response(result, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
            },
          })
        );
      });

      child.stdin.end();
    });
  } catch (error) {
    return new Response(
      `❌ Test failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
