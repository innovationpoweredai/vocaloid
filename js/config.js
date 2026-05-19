/**
 * SUPABASE CONFIGURATION
 * 
 * This file contains Supabase credentials for authentication.
 * These are PUBLIC keys (anon key) - it's safe to expose them.
 * Never expose your SERVICE ROLE KEY in frontend code.
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
    const protocol = window.location.protocol;
    
    console.log('[CONFIG] Detecting environment:', { host, protocol });
    
    if (host === 'vocaloid.in' || host === 'www.vocaloid.in') {
      console.log('[CONFIG] Using production redirect URL');
      return this.REDIRECT_URLS.production;
    } else if (host.includes('github.io')) {
      console.log('[CONFIG] Using GitHub Pages redirect URL');
      return this.REDIRECT_URLS.github_pages;
    } else if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      console.log('[CONFIG] Using localhost redirect URL');
      return this.REDIRECT_URLS.localhost;
    }
    
    // Fallback to current origin
    const fallback = window.location.origin + '/auth/callback';
    console.log('[CONFIG] Using fallback redirect URL:', fallback);
    return fallback;
  },
  
  // Debug flag
  DEBUG: true
};

// Log configuration on load
console.log('[CONFIG] Supabase Configuration Loaded:', {
  url: SUPABASE_CONFIG.URL,
  keyLength: SUPABASE_CONFIG.ANON_KEY.length,
  currentRedirect: SUPABASE_CONFIG.CURRENT_REDIRECT,
  debug: SUPABASE_CONFIG.DEBUG
});

// Validate configuration
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  console.error('❌ [CONFIG] Supabase configuration missing! Check config.js');
  throw new Error('Supabase config missing');
}

console.log('✅ [CONFIG] Configuration validated');