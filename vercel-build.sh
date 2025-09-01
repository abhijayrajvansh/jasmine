#!/bin/bash

# Vercel build script to ensure Claude CLI is available
echo "🚀 Vercel build script starting..."

# Install Claude CLI if not already installed
echo "📦 Installing Claude CLI..."
npm install @anthropic-ai/claude-code --no-save || {
    echo "⚠️ Claude CLI installation failed, trying alternative approach..."
    # Alternative: use npx approach
    echo "Using npx fallback approach"
}

# Verify installation
if [ -f "./node_modules/.bin/claude" ]; then
    echo "✅ Claude CLI installed successfully at ./node_modules/.bin/claude"
    ./node_modules/.bin/claude --version || echo "⚠️ Claude version check failed"
else
    echo "⚠️ Local Claude CLI not found, will use npx approach"
fi

# Run the actual build
echo "🏗️ Running Next.js build..."
next build --turbopack

echo "✅ Build complete!"
