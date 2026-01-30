# Fixing "Too Many Open Files" Error on macOS

If you're getting `EMFILE: too many open files` errors, follow these steps:

## Quick Fix (Temporary)

Before running `npm start`, increase the file limit in your current terminal:

```bash
ulimit -n 10240
npm start
```

## Permanent Fix

Add this to your `~/.zshrc` (or `~/.bash_profile` if using bash):

```bash
# Increase file descriptor limit for development
ulimit -n 10240
```

Then restart your terminal or run:
```bash
source ~/.zshrc
```

## System-Wide Fix (Recommended)

For a permanent system-wide fix:

```bash
# Edit system limits
sudo nano /etc/launchd.conf

# Add these lines:
limit maxfiles 65536 200000

# Then restart your Mac, or run:
sudo launchctl limit maxfiles 65536 200000
```

## Alternative: Use Watchman

If you have Facebook's Watchman installed, it handles file watching more efficiently:

```bash
brew install watchman
```

Then the Metro config will automatically use it.

## Current Configuration

The project is configured to:
- Use polling instead of native file watching (reduces file descriptors)
- Ignore unnecessary directories (node_modules, .git, .expo, etc.)
- Optimize Metro bundler settings

If issues persist after increasing the file limit, try:
1. Closing other applications that might be watching files
2. Restarting your terminal
3. Restarting your Mac
