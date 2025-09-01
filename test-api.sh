#!/bin/bash

# Test script for Claude CLI Web Interface
# This script tests the API endpoint directly

echo "🧪 Testing Claude CLI Web Interface API..."
echo ""

# Test 1: Basic API health check
echo "📡 Test 1: Testing API endpoint with simple prompt..."
curl -s -X POST 'http://localhost:3000/api/run' \
  -H "Content-Type: application/json" \
  -d '{"prompt":"echo Hello World"}' | head -20

echo -e "\n\n"

# Test 2: Empty prompt (should return error)
echo "❌ Test 2: Testing with empty prompt (should fail)..."
curl -s -X POST 'http://localhost:3000/api/run' \
  -H "Content-Type: application/json" \
  -d '{"prompt":""}'

echo -e "\n\n"

# Test 3: Invalid JSON (should fail gracefully)
echo "🚫 Test 3: Testing with invalid JSON (should fail gracefully)..."
curl -s -X POST 'http://localhost:3000/api/run' \
  -H "Content-Type: application/json" \
  -d 'invalid json'

echo -e "\n\n"

echo "✅ API tests completed!"
echo ""
echo "💡 Tips:"
echo "   - Make sure your Claude CLI is configured in .env.local"
echo "   - Start the dev server with: npm run dev"
echo "   - Open http://localhost:3000 in your browser"
echo ""
