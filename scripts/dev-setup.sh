#!/bin/bash
echo "🚀 Setting up BoostTrade development environment..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

if ! node --version | grep -q "v18\|v19\|v20"; then
    echo "❌ Node.js 18+ required. Please install Node.js 18 or higher."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating local environment file..."
    cp .env.example .env.local
    echo "✅ Please update .env.local with your configuration"
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install

echo "✅ Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev              - Start development server"
echo "  npm run test             - Run all tests"
echo "  npm run test:e2e         - Run end-to-end tests"
echo ""
echo "🌐 Open http://localhost:3000 to view the application"
