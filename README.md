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
- Docker & Docker Compose (for local PostgreSQL)
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
   # Quick setup (automatically generates NEXTAUTH_SECRET)
   ./scripts/setup-env.sh
   
   # Or manual setup
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables in `.env.local`:

   ### `NEXTAUTH_SECRET`
   Generate a random 32-character secret key:
   ```bash
   # Option 1: Using OpenSSL (recommended)
   openssl rand -base64 32
   
   # Option 2: Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # Option 3: Online generator
   # Visit: https://generate-secret.vercel.app/32
   ```
   Add to `.env.local`:
   ```
   NEXTAUTH_SECRET=your_generated_secret_here
   ```

   ### `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   Set up Google OAuth credentials:
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one
   3. Enable the Google+ API:
      - Go to "APIs & Services" → "Library"
      - Search for "Google+ API" and enable it
   4. Create OAuth 2.0 credentials:
      - Go to "APIs & Services" → "Credentials"
      - Click "Create Credentials" → "OAuth 2.0 Client IDs"
      - Application type: "Web application"
      - Authorized redirect URIs:
        - `http://localhost:3000/api/auth/callback/google` (development)
        - `https://yourdomain.com/api/auth/callback/google` (production)
   5. Copy the Client ID and Client Secret
   
   Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

   ### `POSTGRES_URL`
   Set up PostgreSQL database:
   
   **Option 1: Vercel Postgres (Recommended)**
   1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   2. Select your project → "Storage" tab
   3. Click "Create Database" → "Postgres"
   4. Copy the connection string from "Quickstart" → ".env.local" tab
   
   **Option 2: Supabase (Free tier)**
   1. Go to [Supabase](https://supabase.com/) and create a project
   2. Go to Settings → Database
   3. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password
   
   **Option 3: Railway (Free tier)**
   1. Go to [Railway](https://railway.app/) and create a PostgreSQL service
   2. Copy the connection string from the "Connect" tab
   
   **Option 4: Docker Compose (Local Development)**
   ```bash
   # Start PostgreSQL with Docker Compose
   ./scripts/docker-db.sh start
   
   # Or manually
   docker-compose up -d postgres
   ```
   
   **Option 5: Local PostgreSQL Installation**
   ```bash
   # Install PostgreSQL locally, then:
   createdb dictation_drawing_game
   ```
   
   Add to `.env.local`:
   ```
   POSTGRES_URL=postgresql://username:password@host:port/database
   # Docker Compose: postgresql://postgres:password@localhost:5432/dictation_drawing_game
   # Local install: postgresql://postgres:password@localhost:5432/dictation_drawing_game
   ```

   ### `BLOB_READ_WRITE_TOKEN`
   Set up Vercel Blob storage:
   1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   2. Select your project → "Storage" tab
   3. Click "Create Database" → "Blob"
   4. Go to the Blob storage settings
   5. Copy the "Read/Write Token"
   
   Add to `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here
   ```

   ### Complete `.env.local` Example
   ```bash
   NEXTAUTH_SECRET=abc123xyz789randomsecretkey32chars
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   POSTGRES_URL=postgresql://user:pass@host:5432/dictation_drawing_game
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_AbCdEfGhIjKlMnOpQrStUvWxYz123456
   ```

4. **Start the local database**
   ```bash
   # Option 1: Using npm script
   npm run db:start
   
   # Option 2: Using script directly
   ./scripts/docker-db.sh start
   ```

5. **Set up the database schema**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with child-friendly design
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for file uploads
- **Deployment**: Vercel with automatic GitHub integration
- **PWA**: Service Worker with offline support
- **Drawing**: HTML5 Canvas with touch/mouse support

## Troubleshooting

### Common Issues

**❌ "NEXTAUTH_SECRET is not defined"**
- Run `./scripts/setup-env.sh` or generate a secret manually
- Ensure `.env.local` contains `NEXTAUTH_SECRET=your_secret_here`

**❌ "Google OAuth error: redirect_uri_mismatch"**
- Check your Google Cloud Console OAuth redirect URIs
- For development: `http://localhost:3000/api/auth/callback/google`
- For production: `https://yourdomain.com/api/auth/callback/google`

**❌ "Database connection error"**
- Verify your `POSTGRES_URL` in `.env.local`
- Run `npm run db:push` to sync the database schema
- Check if your database service is running

**❌ "Blob storage upload fails"**
- Verify `BLOB_READ_WRITE_TOKEN` in `.env.local`
- Ensure Vercel Blob is enabled in your Vercel project

**❌ "Module resolution errors in tests"**
- Run `npm install --legacy-peer-deps` to resolve peer dependency conflicts
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**❌ "Docker database connection issues"**
- Check if Docker is running: `docker --version`
- Start the database: `./scripts/docker-db.sh start`
- Check status: `./scripts/docker-db.sh status`
- View logs: `./scripts/docker-db.sh logs`
- Ensure port 5432 is not in use by another PostgreSQL instance

### Development Commands

```bash
# Environment setup
./scripts/setup-env.sh          # Quick environment setup
./scripts/docker-db.sh start    # Start local PostgreSQL with Docker

# Database management
npm run db:start                # Start local PostgreSQL (Docker)
npm run db:generate             # Generate database migrations
npm run db:push                 # Push schema to database
npm run db:studio              # Open Drizzle Studio (database GUI)
npm run db:stop                 # Stop local PostgreSQL (Docker)

# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Testing
npm test                       # Run unit tests
npm run test:e2e              # Run end-to-end tests
npm run lint                  # Run ESLint
npm run type-check            # Run TypeScript checks

# Docker database management
./scripts/docker-db.sh start    # Start PostgreSQL database
./scripts/docker-db.sh stop     # Stop PostgreSQL database
./scripts/docker-db.sh logs     # View database logs
./scripts/docker-db.sh status   # Check database status
./scripts/docker-db.sh connect  # Connect with psql
./scripts/docker-db.sh clean    # Remove database and data (destructive!)

# Word list management  
npm run wordlist:generate theme     # Generate themed word lists
npm run wordlist:validate file.txt  # Validate word list format
./scripts/generate-wordlist.sh      # Direct generator usage
./scripts/validate-wordlist.sh      # Direct validator usage
```

### Production Deployment

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Set environment variables in Vercel Dashboard:**
   - Go to your project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Don't forget to update `NEXTAUTH_URL` to your production domain

3. **Enable Vercel Storage:**
   - Postgres: Project → Storage → Create Database → Postgres
   - Blob: Project → Storage → Create Database → Blob

## 📚 Word Lists

For detailed instructions on creating and uploading word lists, see **[WORDLISTS.md](WORDLISTS.md)**

### Quick Start - Word Lists
1. Create a text file with one word per line:
   ```
   cat
   dog
   bird
   fish
   ```
2. Sign in as a teacher at `/teacher`
3. Go to "Word Sets" → "Upload New Word Set"
4. Upload your file and activate it

### Example Files
Check the `/examples/` folder for sample word lists:
- `animals.txt` - Basic animal names
- `colors.txt` - Color names  
- `fruits.txt` - Fruit names
- `transportation.txt` - Vehicles and transport
- `days-of-week.txt` - Days of the week
- `months.txt` - Months of the year
- `animals-with-images.csv` - Animals with hint images

### Word List Tools
Generate and validate word lists:
```bash
# Generate themed word lists
npm run wordlist:generate animals my-animals.txt
npm run wordlist:generate days
npm run wordlist:generate colors

# Validate word lists before uploading
npm run wordlist:validate my-animals.txt
npm run wordlist:validate examples/animals.txt
```

Built with ❤️ for children's education