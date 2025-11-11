# Authentication & User Management Guide

This guide explains how signup, login, and user roles work in the Dictation Drawing Game.

## 🔐 Authentication Overview

The app uses **Google OAuth** for secure authentication via NextAuth.js. There's no traditional signup form - users sign in directly with their Google account.

### Supported User Roles
- **👨‍🎓 Student** (default) - Can play games and submit drawings
- **👩‍🏫 Teacher** - Can manage word sets, view student work, rate submissions
- **⚙️ Admin** - Full system access (manual assignment only)

## 🚀 How to Sign Up & Login

### For Students

1. **Go to the app** 
   - Visit: `http://localhost:3000` (development) or your deployed URL

2. **Click "Sign In"**
   - You'll see a "Sign in with Google" button
   - Click it to start the authentication process

3. **Authorize with Google**
   - Choose your Google account
   - Grant permission to the app
   - You'll be redirected back to the game

4. **Start Playing!**
   - You're automatically assigned the "student" role
   - You can immediately start playing word games
   - Your drawings and progress are saved

### For Teachers

1. **Sign in first as a Student** (same process as above)

2. **Request Teacher Access**
   - Contact your system administrator
   - Provide your email address used for Google sign-in
   - Admin will upgrade your account to "teacher" role

3. **Access Teacher Dashboard**
   - Once upgraded, visit: `/teacher`
   - You'll have access to word set management
   - Can view and rate student submissions

## 📱 Authentication Flow

### First-Time Users
```
1. Click "Sign In" → 2. Google OAuth → 3. Account Created → 4. Role: Student
```

### Returning Users
```
1. Click "Sign In" → 2. Google OAuth → 3. Existing Account → 4. Previous Role
```

## 🎯 User Interface Elements

### Not Signed In
- **Home page**: Shows sign-in prompt
- **Game page**: Redirects to sign-in
- **Teacher page**: Redirects to sign-in

### Signed In as Student
- **Home page**: Access to game interface
- **Game page**: Full gameplay functionality
- **Teacher page**: "Access denied" message

### Signed In as Teacher
- **Home page**: Access to game interface
- **Game page**: Full gameplay functionality  
- **Teacher page**: Full dashboard access

## 🔧 Technical Implementation

### Authentication Provider
```javascript
// Google OAuth configuration
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
})
```

### Session Management
- Sessions are stored in PostgreSQL database
- User profile includes: name, email, image, role, classIds
- Role is automatically set to 'student' for new users

### Role Assignment
```sql
-- Default role for new users
role: 'student'

-- Manual upgrade to teacher (database update required)
UPDATE users SET role = 'teacher' WHERE email = 'teacher@example.com';
```

## 👩‍💼 Admin Tasks

### Promoting Users to Teacher

**Option 1: Database Update**
```sql
-- Connect to your database
UPDATE users 
SET role = 'teacher' 
WHERE email = 'teacher@school.edu';
```

**Option 2: Using Drizzle Studio**
1. Run: `npm run db:studio`
2. Open the users table
3. Find the user by email
4. Change role from 'student' to 'teacher'
5. Save changes

**Option 3: Direct Database Access**
```bash
# Connect to database
npm run db:connect

# Update user role
UPDATE users SET role = 'teacher' WHERE email = 'new-teacher@example.com';
```

### Creating Admin Users
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@school.edu';
```

## 🔒 Security Features

### Google OAuth Security
- Uses official Google OAuth 2.0 protocol
- No password storage required
- Automatic account verification via Google
- Secure token-based sessions

### Role-Based Access Control
- API routes check user roles before allowing access
- Teacher-only endpoints reject student requests
- Session-based authorization on all protected routes

### Data Protection
- User sessions stored securely in database
- CSRF protection via NextAuth.js
- Environment variable protection for OAuth secrets

## 📋 Troubleshooting

### "Sign In Failed" Errors

**Google OAuth Setup Issues:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
2. Check redirect URLs in Google Cloud Console:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
3. Ensure Google+ API is enabled in Google Cloud Console

**Database Connection Issues:**
1. Verify `POSTGRES_URL` is correct in `.env.local`
2. Check if database is running: `npm run db:status`
3. Run database setup: `npm run db:push`

### "Access Denied" for Teachers

**Role Assignment Issues:**
1. Check if user role is set correctly in database
2. Sign out and sign back in to refresh session
3. Verify user is accessing correct teacher route (`/teacher`)

**Database Query:**
```sql
-- Check user role
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

### Session Problems

**Clear Session Issues:**
1. Sign out completely
2. Clear browser cookies for the site
3. Sign in again
4. Check network tab for authentication errors

## 🎨 Customization

### Adding New Roles
```typescript
// Update schema.ts
role: text('role', { 
  enum: ['teacher', 'student', 'admin', 'parent'] 
}).default('student')
```

### Custom Sign-In Page
- Edit: `src/app/auth/signin/page.tsx`
- Customize styling, messaging, or add additional providers
- Maintain Google OAuth for security

### Role-Based Redirects
```typescript
// Add to auth callbacks
callbacks: {
  signIn: async ({ user }) => {
    // Custom redirect logic based on role
    return true;
  }
}
```

## 📞 Support

### For Users
1. Try signing out and back in
2. Clear browser cache and cookies
3. Contact your teacher or admin

### For Administrators  
1. Check environment variables are set correctly
2. Verify database connection and schema
3. Review Google Cloud Console OAuth setup
4. Check server logs for detailed error messages

### For Developers
1. Review NextAuth.js documentation
2. Check Drizzle ORM setup and migrations
3. Verify Google OAuth configuration
4. Test authentication flow in development

---

## Quick Reference

### URLs
- **Sign In**: `/auth/signin`
- **Student Game**: `/game` 
- **Teacher Dashboard**: `/teacher`
- **Home**: `/`

### Environment Variables Required
```bash
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
POSTGRES_URL=your_database_url
```

### Database Commands
```bash
npm run db:start      # Start local database
npm run db:generate   # Generate migrations (if schema changed)
npm run db:push       # Push schema directly (for development)
npm run db:migrate    # Run pending migrations (for production)
npm run db:studio     # Open database GUI
npm run db:connect    # Direct database access
```