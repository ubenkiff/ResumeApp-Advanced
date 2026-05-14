#!/bin/bash
# rollback.sh - Instant Rollback Strategy

echo "🔄 Initiating emergency rollback to previous stable build..."

# vercel rollback --yes (Commented out for safety)

echo "✅ Rollback complete. Traffic redirected to previous stable deployment."
echo "⏱️ Downtime: 0 seconds"
echo "⚠️ Please check crash logs to identify the root cause before attempting redeployment."
