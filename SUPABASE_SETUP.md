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
3. https://vocaloid.in/auth/callback https://innovationpoweredai.github.io/vocaloid/auth/callback http://localhost:8000/auth/callback
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
https://vocaloid.in/auth/callback https://innovationpoweredai.github.io/vocaloid/auth/callback http://localhost:8000/auth/callback
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
