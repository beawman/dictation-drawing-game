# Dictation Drawing Game

A cross-platform educational game where children aged 4-7 listen to spoken words, draw what they hear, and receive feedback and scoring. Built with Next.js 15, TypeScript, and deployed on Vercel.

## Features

### For Children (4-7 years old)
- 🎧 **Listen**: Clear text-to-speech pronunciation of words
- ✏️ **Draw**: Child-friendly drawing interface with touch and mouse support
- ⭐ **Learn**: Immediate feedback with stars, animations, and encouragement
- 📱 **Offline Mode**: Works offline with cached word sets
- 🎨 **Simple UI**: Large buttons, colorful interface, comic sans font

### For Teachers
- 📚 **Word Management**: Upload CSV/TXT files with weekly word sets
- 📊 **Progress Tracking**: View all student submissions and drawings
- ⭐ **Manual Rating**: Review and rate student drawings (1-5 stars)
- 📈 **Analytics**: Export results and track class progress
- 📅 **Scheduling**: Set active weeks and manage multiple word sets

### Technical Features
- 🔒 **Authentication**: Google OAuth with NextAuth.js
- 🗃️ **Database**: PostgreSQL with Drizzle ORM
- 📁 **File Storage**: Vercel Blob for images and drawings
- 🎯 **PWA Support**: Works offline and can be installed as an app
- 🔄 **Auto-sync**: Submissions sync automatically when back online

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Vercel account (for deployment)
- Google Cloud Console account (for OAuth)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dictation-drawing-game.git
   cd dictation-drawing-game
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   - `NEXTAUTH_SECRET`: Random secret key for NextAuth
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `POSTGRES_URL`: PostgreSQL connection string
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with child-friendly design
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for file uploads
- **Deployment**: Vercel with automatic GitHub integration
- **PWA**: Service Worker with offline support
- **Drawing**: HTML5 Canvas with touch/mouse support

Built with ❤️ for children's education