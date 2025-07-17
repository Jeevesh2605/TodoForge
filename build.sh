#!/bin/bash

# Build script for TodoForge backend deployment
echo "Starting build process..."

# Navigate to backend directory
cd Back-end

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Verify installation
echo "Verifying installation..."
node -e "console.log('Node.js version:', process.version)"
npm list --depth=0

echo "Build completed successfully!"
