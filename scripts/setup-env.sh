#!/bin/bash

# Setup script for Dictation Drawing Game environment variables
echo "🎨 Dictation Drawing Game - Environment Setup"
echo "============================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Creating backup..."
    cp .env.local .env.local.backup
    echo "✅ Backup created as .env.local.backup"
fi

# Copy .env.example to .env.local
cp .env.example .env.local
echo "✅ Copied .env.example to .env.local"
echo ""

# Generate NEXTAUTH_SECRET
echo "🔑 Generating NEXTAUTH_SECRET..."
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    # Replace the placeholder in .env.local
    sed -i.bak "s/NEXTAUTH_SECRET=your-nextauth-secret-key-here/NEXTAUTH_SECRET=$SECRET/" .env.local
    echo "✅ Generated and set NEXTAUTH_SECRET"
elif command -v node &> /dev/null; then
    SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    sed -i.bak "s/NEXTAUTH_SECRET=your-nextauth-secret-key-here/NEXTAUTH_SECRET=$SECRET/" .env.local
    echo "✅ Generated and set NEXTAUTH_SECRET using Node.js"
else
    echo "⚠️  Could not generate NEXTAUTH_SECRET automatically."
    echo "   Please generate one manually and add it to .env.local"
    echo "   You can use: https://generate-secret.vercel.app/32"
fi

echo ""
echo "📝 Next steps:"
echo "1. Start local database: ./scripts/docker-db.sh start"
echo "2. Set up database schema: npm run db:push"
echo "3. Set up Google OAuth credentials at: https://console.cloud.google.com/"
echo "4. Set up Vercel Blob storage for file uploads"
echo "5. Update the corresponding values in .env.local"
echo ""
echo "📖 See README.md for detailed setup instructions."
echo ""
echo "🚀 Quick start:"
echo "   ./scripts/docker-db.sh start  # Start PostgreSQL"
echo "   npm run db:push              # Set up database schema"
echo "   npm run dev                  # Start development server"
echo ""
echo "💡 Note: The .env.local file is ready with Docker database URL"