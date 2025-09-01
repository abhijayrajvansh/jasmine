#!/bin/bash

# Development setup script for Claude CLI Web Interface

echo "🚀 Setting up Claude CLI Web Interface..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the right directory?"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Configuration steps:"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    echo "📝 Please edit .env.local to configure your Claude CLI path:"
    echo ""
    cat .env.local
else
    echo "❌ .env.local file not found"
    echo "📝 Please create .env.local with your Claude CLI configuration"
fi

echo ""
echo "🔧 Testing your Claude CLI setup..."

# Test if claude-code command exists
if command -v claude-code &> /dev/null; then
    echo "✅ claude-code command found in PATH"
    claude-code --help | head -5
else
    echo "⚠️  claude-code command not found in PATH"
    echo "   Please ensure your Claude CLI is installed and accessible"
    echo "   Or set CLAUDE_CLI_PATH in .env.local to the full path"
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Configure your Claude CLI path in .env.local"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:3000"
echo "   4. Test the API: ./test-api.sh"
echo ""
echo "✨ Ready to go! Happy coding!"
