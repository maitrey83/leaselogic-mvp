#!/bin/bash

echo "🚀 Building LeaseLogic for production..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p dist
cp -r build/* dist/
cp -r backend dist/

echo "✅ Build complete! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway/Heroku"
echo "2. Deploy frontend to Vercel/Netlify"
echo "3. Update API URLs in production"
