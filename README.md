# Claude CLI Web Interface

A beautiful, modern web interface for running Claude CLI commands locally. This is a complete MVP that provides a streaming terminal-like experience through your browser.

![Claude CLI Web Interface](https://via.placeholder.com/800x400/1e293b/ffffff?text=Claude+CLI+Web+Interface)

## Features

✨ **Beautiful Modern UI** - Gradient backgrounds, glassmorphism effects, and responsive design  
🔄 **Real-time Streaming** - See command output as it happens  
⚡ **Fast & Responsive** - Built with Next.js 15 and React 19  
🛡️ **Concurrency Protection** - Only one command runs at a time  
🎮 **Interactive Controls** - Run, stop, and clear with intuitive buttons  
📱 **Mobile Friendly** - Works great on all device sizes  

## Prerequisites

- Node.js 18+ installed
- Claude CLI installed locally and accessible (see [Configuration](#configuration))
- Basic terminal knowledge

## Quick Start

1. **Clone and install**:
```bash
cd my-claude-ui
npm install
```

2. **Configure your Claude CLI** (see [Configuration](#configuration))

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser** to `http://localhost:3000`

5. **Enter a prompt** and click **Run** to see it in action!

## Configuration

### Method 1: Edit .env.local (Recommended)

The project includes a `.env.local` file. Edit it to point to your Claude CLI:

```bash
# Replace with your actual Claude CLI path and arguments
CLAUDE_CLI_PATH=claude-code
CLAUDE_CLI_ARGS=--completion

# If your CLI binary is not on PATH, use the full path:
# CLAUDE_CLI_PATH=/usr/local/bin/claude-code
# CLAUDE_CLI_PATH=/Users/your-username/path/to/claude-code
```

### Method 2: Set Environment Variables

```bash
export CLAUDE_CLI_PATH=/path/to/your/claude-cli
export CLAUDE_CLI_ARGS="--completion"
npm run dev
```

### Method 3: System PATH

If your Claude CLI is accessible via `claude-code` command globally, no configuration needed!

## Testing the API

You can test the API directly with curl:

```bash
curl -N -X POST 'http://localhost:3000/api/run' \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write a simple hello world function in Python"}'
```

## How It Works

### Architecture

```
┌─────────────────┐    HTTP POST     ┌─────────────────┐    spawn()    ┌─────────────────┐
│   Web Browser   │ ───────────────> │   Next.js API   │ ────────────> │   Claude CLI    │
│   (React UI)    │ <─────────────── │   (route.ts)    │ <──────────── │   (Binary)      │
└─────────────────┘   Streaming      └─────────────────┘   stdout/err  └─────────────────┘
```

### Components

- **`app/page.tsx`** - React frontend with modern UI
- **`app/api/run/route.ts`** - Next.js API route that spawns CLI and streams output
- **`.env.local`** - Configuration for CLI path and arguments

### Key Features

- **Streaming Response**: Uses `ReadableStream` to stream command output in real-time
- **Process Management**: Properly handles process lifecycle and cleanup
- **Error Handling**: Captures stdout, stderr, and process errors
- **Concurrency Guard**: Prevents multiple simultaneous commands
- **Graceful Termination**: Can abort commands mid-execution

## Example Prompts

Try these example prompts:

```
Write a Python function to calculate fibonacci numbers

Create a simple Express.js server with error handling

Explain the difference between let, const, and var in JavaScript

Debug this code: function sum(arr) { return arr.reduce(+); }

Write a React component for a todo list with TypeScript
```

## Troubleshooting

### CLI Not Found
**Error**: `[error] spawn claude-code ENOENT`

**Solutions**:
1. Set full path in `.env.local`: `CLAUDE_CLI_PATH=/full/path/to/claude-code`
2. Add CLI to your system PATH
3. Verify CLI works in terminal: `claude-code --help`

### Permission Denied
**Error**: `[error] spawn EACCES`

**Solution**: Make CLI executable:
```bash
chmod +x /path/to/claude-code
```

### No Output Streaming
CLI might buffer output. Try:
1. Different CLI arguments in `CLAUDE_CLI_ARGS`
2. Check if CLI has unbuffered output options
3. Verify CLI works with stdin: `echo "test prompt" | claude-code`

### Port Already in Use
**Error**: `Error: listen EADDRINUSE :::3000`

**Solutions**:
1. Kill existing process: `lsof -ti:3000 | xargs kill`
2. Use different port: `npm run dev -- -p 3001`

## Development

### Project Structure
```
my-claude-ui/
├── app/
│   ├── api/run/
│   │   └── route.ts          # API endpoint for CLI execution
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main UI component
├── .env.local               # Environment configuration
├── package.json
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Key Technologies
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Node.js Streams** - Real-time output streaming

### Building for Production

```bash
npm run build
npm start
```

## Next Steps & Improvements

Here are some ideas for extending this MVP:

### Near-term Enhancements
- **History Panel**: Save and replay previous commands
- **File Upload**: Drag & drop files to include in prompts
- **Output Export**: Save responses to files
- **Syntax Highlighting**: Better code formatting in output
- **Prompt Templates**: Pre-built prompt examples

### Advanced Features
- **Multiple CLI Support**: Switch between different AI tools
- **Session Management**: Persistent conversation context
- **Batch Processing**: Queue multiple prompts
- **Output Parsing**: Extract and format code blocks
- **Integration**: Connect with VS Code, GitHub, etc.

### Production Considerations
- **Authentication**: User login and session management
- **Rate Limiting**: Prevent API abuse
- **Logging**: Command history and audit trails
- **Monitoring**: Performance and error tracking
- **Scaling**: Multi-user support with queues

## Contributing

This is an MVP template - feel free to fork and customize for your needs!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test locally: `npm run dev`
5. Submit a pull request

## License

MIT License - feel free to use this code for any purpose.

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify your Claude CLI works independently
3. Check the browser developer console for errors
4. Test the API directly with curl

---

**Happy coding!** 🚀

This MVP gives you a solid foundation for building more sophisticated AI CLI interfaces. Customize the UI, add your own features, and make it your own!
