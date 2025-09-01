"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        body: JSON.stringify({ prompt }),
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
