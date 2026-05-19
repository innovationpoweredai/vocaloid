-- ============================================
-- VOCALOID.IN - SUPABASE DATABASE SCHEMA
-- ============================================
-- 
-- Copy and paste this entire script into Supabase SQL Editor
-- to set up your database schema.
-- 
-- Steps:
-- 1. Go to Supabase Project → SQL Editor
-- 2. New Query
-- 3. Copy this entire file
-- 4. Paste and Run
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Discord Identity
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Gamification
  xp INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  bio TEXT,
  is_staff BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON public.users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_xp ON public.users(xp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (public)
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = discord_id)
  WITH CHECK (auth.uid()::text = discord_id);

-- Only allow inserts via authenticated users
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = discord_id);

-- ============================================
-- ACTIVITY LOG TABLE (Optional - for future)
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_log(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF SCHEMA
-- ============================================
-- 
-- Next Steps:
-- 1. Go to Authentication → Providers → Discord
-- 2. Enable Discord provider
-- 3. Configure Discord OAuth in Discord Developer Portal
-- 4. Set Redirect URLs in Discord settings
-- 5. Copy Client ID and Client Secret to Supabase
--