# Supabase + Discord OAuth Setup Guide

## Overview

This guide walks through setting up Supabase authentication with Discord OAuth for **vocaloid.in**.

The system is:
- ✅ Production-stable
- ✅ GitHub Pages compatible
- ✅ Custom domain compatible
- ✅ No backend server required
- ✅ Modular and maintainable

---

## Part 1: Supabase Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**
4. Fill in:
   - **Name**: vocaloid-in
   - **Database Password**: Generate secure password
   - **Region**: Choose closest to your users (e.g., ap-south-1 for India)
5. Click **Create new project** and wait 2-3 minutes

### 2. Get Your Credentials

Once created:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `SUPABASE_CONFIG.URL` in `js/config.js`
   - **Anon Public Key** → `SUPABASE_CONFIG.ANON_KEY` in `js/config.js`

**Never share your Service Role Key in frontend code!**

### 3. Create Database Schema

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire contents of `sql/schema.sql`
4. Paste into the SQL editor
5. Click **Run**

This creates:
- `users` table with all necessary columns
- Indexes for performance
- Row-level security policies
- Automatic timestamp updates

---

## Part 2: Discord OAuth Configuration

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it: **vocaloid.in**
4. Click **Create**
5. Go to **OAuth2** → **General**
6. Copy **Client ID** (you'll need this)

### 2. Add Redirect URLs

In Discord Developer Portal:

1. Go to **OAuth2** → **General** (or **OAuth2** → **Authorization**)
2. Add **Redirect URLs**:
   ```
   https://vocaloid.in/auth/callback
   https://innovationpoweredai.github.io/vocaloid/auth/callback
   http://localhost:8000/auth/callback
   ```
3. Click **Save**

### 3. Copy Client Secret

1. Still in **OAuth2** → **General**
2. Look for **CLIENT SECRET**
3. Click **Reset Secret** or copy existing one
4. Copy the secret (you'll need this for Supabase)

---

## Part 3: Supabase Discord Provider Setup

### 1. Go to Supabase Authentication

1. In your Supabase project, go to **Authentication**
2. Click **Providers** on left sidebar
3. Find **Discord** in the list

### 2. Enable Discord Provider

1. Click on **Discord**
2. Toggle **Enabled** to ON
3. Paste your Discord **Client ID** in the first field
4. Paste your Discord **Client Secret** in the second field
5. Click **Save**

### 3. Verify Redirect URLs

In Supabase:
1. Go to **Settings** → **API**
2. Find **OAuth Redirect URL allowlist**
3. Make sure these are listed:
   ```
   https://vocaloid.in/auth/callback
   https://innovationpoweredai.github.io/vocaloid/auth/callback
   http://localhost:8000/auth/callback
   ```
4. If not, add them

---

## Part 4: Update Website Configuration

### 1. Update `js/config.js`

```javascript
const SUPABASE_CONFIG = {
  URL: 'https://your-project-url.supabase.co',
  ANON_KEY: 'your-anon-key-here',
  // ... rest of config
};
```

### 2. Verify Redirect URLs

The config already handles environment detection:
- **Production** (vocaloid.in): `https://vocaloid.in/auth/callback`
- **GitHub Pages**: `https://innovationpoweredai.github.io/vocaloid/auth/callback`
- **Localhost**: `http://localhost:8000/auth/callback`

These must match exactly in both Discord and Supabase settings!

---

## Part 5: Testing

### Local Testing

1. Start a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

2. Open `http://localhost:8000`

3. Click **Login Discord** button

4. You should be redirected to Discord, then back to `/auth/callback.html`

5. Should redirect to home and show your avatar in top bar

### Production Testing

1. Push code to GitHub
2. Visit `https://vocaloid.in`
3. Test Discord login
4. Check Supabase → **Authentication** → **Users** to see the login

---

## Troubleshooting

### "Popup was blocked"

The browser blocked the OAuth popup:
- Firefox: Check popup blockers
- Chrome: Check browser settings
- Some users have popup blockers enabled
- System handles this gracefully with error message

### "Redirect URL mismatch"

Redirect URLs don't match between Discord and Supabase:
- Check both settings for typos
- Must include `https://` or `http://`
- No trailing slashes
- Exact protocol matters (http vs https)

### "Authentication Failed" at callback

Session wasn't established:
- Check browser console for errors (F12)
- Verify SUPABASE_CONFIG is correct
- Make sure anon key is not service key
- Check that Discord provider is enabled in Supabase

### User not appearing in database

SyncUserToDatabase might be failing:
- Check Supabase → **SQL Editor** → verify `users` table exists
- Check RLS policies aren't blocking insert
- Check browser console for specific error

---

## File Structure

```
vocaloid/
├── index.html                 # Main page with auth UI
├── js/
│   ├── config.js             # Supabase credentials (UPDATE THIS)
│   ├── supabase.js           # Supabase client init
│   ├── auth.js               # Login/logout logic
│   ├── session.js            # Database sync
│   └── ui-auth.js            # UI updates based on auth state
├── auth/
│   └── callback.html         # OAuth callback handler
├── sql/
│   └── schema.sql            # Database schema (run in Supabase)
└── SUPABASE_SETUP.md        # This file
```

---

## How It Works

### Authentication Flow

```
1. User clicks "Login Discord"
   ↓
2. loginWithDiscord() called
   ↓
3. Redirected to Discord OAuth
   ↓
4. User approves app
   ↓
5. Discord redirects to /auth/callback
   ↓
6. callback.html confirms session
   ↓
7. Redirects to home
   ↓
8. Session restored automatically
   ↓
9. UI updates with user info
```

### Key Files Explained

**config.js**
- Contains Supabase URL and anon key
- Auto-detects environment for correct redirect URL
- Safe to expose (uses public anon key only)

**supabase.js**
- Initializes Supabase client
- Loaded before other auth scripts
- Provides getSupabaseClient() function

**auth.js**
- Handles Discord OAuth login/logout
- Prevents duplicate login calls
- Restores sessions on page load
- Detects popup blockers
- Emits custom auth events

**session.js**
- Syncs user to database on login
- Creates new user or updates last_login
- Provides XP and badge functions for future use
- Handles Discord user metadata extraction

**ui-auth.js**
- Listens to auth events
- Updates UI when auth state changes
- Shows user avatar/username
- Manages protected content visibility
- Shows toast notifications

---

## Script Load Order (Important!)

In `index.html`, scripts must load in this order:

```html
<!-- 1. Supabase library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Your config -->
<script src="js/config.js"></script>

<!-- 3. Supabase init -->
<script src="js/supabase.js"></script>

<!-- 4. Auth logic -->
<script src="js/auth.js"></script>

<!-- 5. Database sync -->
<script src="js/session.js"></script>

<!-- 6. UI updates -->
<script src="js/ui-auth.js"></script>
```

The website already includes these in index.html!

---

## Environment Variables (Optional Advanced)

For even more security, use environment variables:

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

Then in config.js:
```javascript
const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_KEY,
};
```

(Requires build step - not needed for static hosting)

---

## Future Extensions

This system is built to scale! You can add:

### XP System
```javascript
await addUserXP(userId, 100);
```

### Badges
```javascript
await addUserBadge(userId, 'early_supporter');
```

### User Profiles
```javascript
const { data } = await getUserProfile(userId);
```

### Role Sync
Extend session.js to sync Discord roles to database

### Admin Panel
Add admin-only routes that check `is_staff` field

### Comments/Posts
Create tables linked via `user_id` foreign key

---

## Security Checklist

- ✅ Never expose SERVICE_ROLE_KEY in frontend
- ✅ Always use ANON_KEY for frontend
- ✅ Keep Redirect URLs exact match
- ✅ Enable RLS policies on all tables
- ✅ Use HTTPS in production
- ✅ Validate user input on backend (Supabase functions)
- ✅ Never trust client-side auth for sensitive operations

---

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Discord OAuth**: https://discord.com/developers/docs/topics/oauth2
- **Auth Examples**: https://github.com/supabase/auth-helpers

---

## Final Checklist

Before going live:

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Discord app created
- [ ] Discord redirect URLs added
- [ ] Supabase Discord provider enabled
- [ ] config.js updated with credentials
- [ ] Tested locally
- [ ] Tested production domain
- [ ] Code pushed to GitHub
- [ ] Custom domain points to GitHub Pages

You're ready to go! 🚀
