#!/bin/bash

# Start script for TodoForge backend
echo "Starting TodoForge backend..."

# Navigate to backend directory
cd Back-end

# Set NODE_ENV if not already set
export NODE_ENV=${NODE_ENV:-production}

echo "Environment: $NODE_ENV"
echo "Node.js version: $(node --version)"
echo "Starting server..."

# Start the server
node server.js
