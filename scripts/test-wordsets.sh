#!/bin/bash
# Quick OAuth bypass for testing
# File: scripts/test-wordsets.sh

echo "🧪 Testing Word Sets API (bypassing OAuth)"
echo "=========================================="

# Test 1: Check active word set
echo "📋 Active Word Set:"
curl -s "http://localhost:3000/api/active-week" | jq '.' 2>/dev/null || echo "❌ No active word set or server not running"

echo ""
echo "📊 Database Word Sets:"
docker-compose exec -T postgres psql -U postgres -d dictation_drawing_game -c "SELECT id, title, active FROM wordsets;"

echo ""
echo "💡 To access via web interface:"
echo "1. Set up Google OAuth credentials in .env.local"
echo "2. Sign in at http://localhost:3000/auth/signin" 
echo "3. Update your user role to 'teacher' in database"
echo "4. Visit http://localhost:3000/teacher"