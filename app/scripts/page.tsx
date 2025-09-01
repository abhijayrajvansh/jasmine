"use client";

import { useState } from "react";

export default function ScriptsPage() {
  const [output, setOutput] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);

  const runInstallation = async () => {
    setIsInstalling(true);
    setOutput("Starting Claude installation...\n");

    try {
      const response = await fetch("/api/install-claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let accumulatedOutput = "Starting Claude installation...\n";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedOutput += chunk;
        setOutput(accumulatedOutput);
      }
    } catch (error) {
      console.error("Installation error:", error);
      setOutput(
        (prev) =>
          prev +
          `\nError: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsInstalling(false);
    }
  };

  const testClaude = async () => {
    setOutput((prev) => prev + "\n\nTesting Claude installation...\n");

    try {
      const response = await fetch("/api/test-claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.text();
      setOutput((prev) => prev + result);
    } catch (error) {
      console.error("Test error:", error);
      setOutput(
        (prev) =>
          prev +
          `\nTest Error: ${
            error instanceof Error ? error.message : String(error)
          }`
      );
    }
  };

  const testConnection = async () => {
    setOutput((prev) => prev + "\n\nTesting API connection...\n");

    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "echo test" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setOutput((prev) => prev + "✅ API connection successful!\n");
    } catch (error) {
      setOutput((prev) => prev + `❌ API connection failed: ${error}\n`);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          Claude Installation Scripts
        </h1>

        <div className="mb-8 space-y-4">
          <button
            onClick={testConnection}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Test API Connection
          </button>

          <button
            onClick={runInstallation}
            disabled={isInstalling}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isInstalling ? "Installing..." : "Install Claude CLI"}
          </button>

          <button
            onClick={testClaude}
            disabled={isInstalling}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Test Claude Installation
          </button>
        </div>

        {output && (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Output:</h2>
            <pre className="whitespace-pre-wrap text-sm text-black bg-gray-50 p-4 rounded border-2 border-gray-300 overflow-auto max-h-96 font-mono">
              {output}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-2">
            Environment Variables
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            After installation, make sure to set these environment variables for
            Vercel deployment:
          </p>
          <div className="bg-gray-100 p-4 rounded border font-mono text-sm">
            <div>CLAUDE_CLI_PATH=./node_modules/.bin/claude</div>
            <div>
              CLAUDE_CLI_ARGS=--print --dangerously-skip-permissions
              --permission-mode bypassPermissions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
