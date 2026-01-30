#!/bin/bash

# Fix for "too many open files" error on macOS
# Run this before starting Expo

echo "Increasing file descriptor limit..."

# Check current limit
CURRENT_LIMIT=$(ulimit -n)
echo "Current limit: $CURRENT_LIMIT"

# Try to increase limit
ulimit -n 10240

NEW_LIMIT=$(ulimit -n)
echo "New limit: $NEW_LIMIT"

if [ "$NEW_LIMIT" -lt 10240 ]; then
    echo "Warning: Could not increase limit to 10240"
    echo "You may need to run: sudo launchctl limit maxfiles 65536 200000"
    echo "Then restart your terminal and try again"
else
    echo "File limit increased successfully!"
    echo "You can now run: npm start"
fi
