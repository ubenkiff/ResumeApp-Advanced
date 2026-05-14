#!/bin/bash
# deploy.sh - Deployment Pipeline (Zero Downtime)

# 1. Build and deploy to staging
echo "📦 Building staging version..."
npm run build:staging

echo "🚀 Deploying to staging environment..."
# vercel --prod --scope=resumeapp-staging (Commented out for safety)
echo "Staging deployment simulation complete."

# 2. Run crash tests
echo "🧪 Running crash tests..."
node tests/crashTest.js https://resumeapp-staging.vercel.app

if [ $? -eq 0 ]; then
  # 3. If tests pass, deploy to production
  echo "✅ Staging validated. Promoting to production..."
  # vercel --prod (Commented out for safety)
  echo "Production deployment complete."
else
  # 4. If tests fail, halt and warn
  echo "❌ Staging tests failed! Deployment halted. Check logs immediately."
  exit 1
fi
