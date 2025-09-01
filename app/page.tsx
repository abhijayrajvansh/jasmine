"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Configuration states
  const [workingDirectory, setWorkingDirectory] = useState(
    "/tmp/claude-workspace"
  );
  const [githubRepo, setGithubRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          workingDirectory,
          githubRepo,
          branch,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setResponse(`Error: ${error.error}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setResponse("Error: No response body");
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        setResponse(accumulatedResponse);
      }
    } catch (error) {
      setResponse(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          Claude UI
        </h1>

        {/* Configuration Section */}
        <div className="mb-6 bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-black">
              Project Configuration
            </h2>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showConfig ? "Hide" : "Show"} Settings
            </button>
          </div>

          {!showConfig && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <strong>Directory:</strong> {workingDirectory}
              </div>
              {githubRepo && (
                <div>
                  <strong>Repo:</strong> {githubRepo}
                </div>
              )}
              <div>
                <strong>Branch:</strong> {branch}
              </div>
            </div>
          )}

          {showConfig && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="workingDirectory"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Working Directory:
                </label>
                <input
                  id="workingDirectory"
                  type="text"
                  value={workingDirectory}
                  onChange={(e) => setWorkingDirectory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  placeholder="/path/to/your/project"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Directory where Claude will execute commands and work with
                  files
                </p>
              </div>

              <div>
                <label
                  htmlFor="githubRepo"
                  className="block text-sm font-medium text-black mb-2"
                >
                  GitHub Repository (optional):
                </label>
                <input
                  id="githubRepo"
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  placeholder="https://github.com/username/repo.git or username/repo"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Repository URL for Claude to clone and work with
                </p>
              </div>

              <div>
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-black mb-2"
                >
                  Branch:
                </label>
                <input
                  id="branch"
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  placeholder="main"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Git branch to checkout for the project
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-black mb-3">
                  Quick Setup Templates:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkingDirectory("/tmp/new-project");
                      setGithubRepo("");
                      setBranch("main");
                    }}
                    className="p-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border"
                    disabled={isLoading}
                  >
                    New Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkingDirectory("/tmp/existing-project");
                      setGithubRepo("https://github.com/user/repo.git");
                      setBranch("main");
                    }}
                    className="p-2 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded border"
                    disabled={isLoading}
                  >
                    Clone Repo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkingDirectory("/tmp/feature-branch");
                      setGithubRepo("https://github.com/user/repo.git");
                      setBranch("feature/new-feature");
                    }}
                    className="p-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded border"
                    disabled={isLoading}
                  >
                    Feature Branch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-black mb-2"
            >
              Enter your prompt:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 p-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black bg-white"
              placeholder="Type your prompt here..."
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? "Running..." : "Submit"}
          </button>
        </form>

        {response && (
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Response:</h2>
            <pre className="whitespace-pre-wrap text-sm text-black bg-white p-4 rounded border-2 border-gray-300 overflow-auto max-h-96">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
