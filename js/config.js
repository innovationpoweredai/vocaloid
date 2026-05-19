/**
 * SUPABASE CONFIGURATION
 * 
 * This file contains Supabase credentials for authentication.
 * These are PUBLIC keys (anon key) - it's safe to expose them.
 * Never expose your SERVICE ROLE KEY in frontend code.
 * 
 * GitHub Pages Setup:
 * - For vocaloid.in (custom domain): Use https://vocaloid.in as redirect URL
 * - For GitHub Pages: Use https://innovationpoweredai.github.io/vocaloid
 * - For localhost development: Use http://localhost:8000
 * 
 * Discord OAuth Configuration:
 * 1. Go to Discord Developer Portal: https://discord.com/developers/applications
 * 2. Create New Application → "vocaloid.in"
 * 3. OAuth2 → General → Add Redirect URLs:
 *    - https://vocaloid.in/auth/callback
 *    - https://innovationpoweredai.github.io/vocaloid/auth/callback
 *    - http://localhost:8000/auth/callback
 * 4. Copy Client ID
 * 5. Go to Supabase Project → Authentication → Providers → Discord
 * 6. Enable Discord provider
 * 7. Paste Client ID and Client Secret
 */

const SUPABASE_CONFIG = {
  // Your Supabase project URL
  URL: 'https://oloojynudacrkusthcbw.supabase.co',
  
  // Your Supabase anon (public) key - SAFE to expose
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sb29qeW51ZGFjcmt1c3RoY2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjEwNTgsImV4cCI6MjA5NDczNzA1OH0.6VKoM8x31ybUBMXrGLR0pD3hzDsBA8w94-_nXk8o1CY',
  
  // Redirect URLs by environment
  REDIRECT_URLS: {
    production: 'https://vocaloid.in/auth/callback',
    github_pages: 'https://innovationpoweredai.github.io/vocaloid/auth/callback',
    localhost: 'http://localhost:8000/auth/callback'
  },
  
  // Current environment (auto-detected)
  get CURRENT_REDIRECT() {
    const host = window.location.hostname;
    
    if (host === 'vocaloid.in' || host === 'www.vocaloid.in') {
      return this.REDIRECT_URLS.production;
    } else if (host.includes('github.io')) {
      return this.REDIRECT_URLS.github_pages;
    } else if (host === 'localhost' || host === '127.0.0.1') {
      return this.REDIRECT_URLS.localhost;
    }
    
    // Fallback to current origin
    return window.location.origin + '/auth/callback';
  }
};

// Validate configuration
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  console.error('❌ Supabase configuration missing! Check config.js');
}
