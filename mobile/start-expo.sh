#!/bin/bash

# Increase file descriptor limit to prevent EMFILE errors
ulimit -n 10240 2>/dev/null || true

# Start Expo
exec expo start "$@"
