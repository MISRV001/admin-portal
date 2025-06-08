#!/bin/bash
echo "🧪 Running quick test suite..."

echo "📝 Type checking..."
npm run type-check

echo "🧹 Linting..."
npm run lint

echo "🧪 Unit tests..."
npm run test

echo "✅ Quick test suite complete!"
