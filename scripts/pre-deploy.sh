
#!/bin/bash

# Pre-deployment script for Railway
# This script runs before the main build process

echo "🚀 Starting pre-deployment setup..."

# Set production environment variables
export NODE_ENV=production
export VITE_APP_ENV=production
export BUILD_ENV=production

# Log environment info
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Environment: $NODE_ENV"

# Clean any previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies with production optimizations
echo "📦 Installing dependencies..."
npm ci --only=production --silent

# Run production build
echo "🔨 Building for production..."
npm run build

# Create health check endpoint
echo "❤️ Setting up health check..."
mkdir -p dist/health
echo '{"status":"ok","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'","version":"1.0.0"}' > dist/health/index.html

# Optimize static assets
echo "⚡ Optimizing assets..."
find dist -name "*.js" -exec gzip -9 -c {} \; > {}.gz 2>/dev/null || true
find dist -name "*.css" -exec gzip -9 -c {} \; > {}.gz 2>/dev/null || true

echo "✅ Pre-deployment setup complete!"
