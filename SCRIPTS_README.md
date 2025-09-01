# Scripts Page Documentation

## Overview
The `/scripts` page provides automated installation and testing of Claude CLI for both local development and Vercel deployment.

## Features

### 1. Install Claude CLI
- Installs Claude CLI locally in the project
- Works for both development and production builds
- Vercel-compatible installation

### 2. Test Claude Installation
- Verifies Claude CLI is working correctly
- Shows version information
- Provides deployment configuration

## Vercel Deployment Setup

### Environment Variables
Add these to your Vercel project settings:

```
CLAUDE_CLI_PATH=./node_modules/.bin/claude
CLAUDE_CLI_ARGS=--print --dangerously-skip-permissions --permission-mode bypassPermissions
```

### Alternative Configuration (if the above fails)
```
CLAUDE_CLI_PATH=npx
CLAUDE_CLI_ARGS=@anthropic-ai/claude-cli --print --dangerously-skip-permissions --permission-mode bypassPermissions
```

### Build Configuration
The project automatically installs Claude CLI during the build process:
- `npm run build` now includes Claude CLI installation
- Vercel build script handles installation gracefully
- Fallback to npx approach if local installation fails

## Usage

1. **Visit `/scripts` page**
2. **Click "Install Claude CLI"** - Installs Claude locally
3. **Click "Test Claude Installation"** - Verifies installation
4. **Deploy to Vercel** with the provided environment variables

## Files Created

- `/app/scripts/page.tsx` - Installation UI
- `/app/api/install-claude/route.ts` - Installation API
- `/app/api/test-claude/route.ts` - Testing API
- `/.env.vercel` - Vercel environment variables template
- `/vercel-build.sh` - Vercel build script
- Updated `package.json` with installation scripts

## Security
- Uses `--dangerously-skip-permissions` for seamless operation
- Bypasses all approval dialogs
- Perfect for sandboxed SaaS environments
