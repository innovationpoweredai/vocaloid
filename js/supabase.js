/**
 * SUPABASE CLIENT INITIALIZATION
 * 
 * This module initializes the Supabase client with the provided credentials.
 * It handles all communication with the Supabase backend.
 * 
 * For static websites, we wait for the Supabase library to load.
 */

let supabaseClient = null;
let clientInitialized = false;

console.log('[SUPABASE] Module loaded, waiting for library...');

/**
 * Initialize Supabase Client
 * Must be called after config.js is loaded
 */
function initSupabase() {
  if (clientInitialized) {
    console.warn('[SUPABASE] Client already initialization in progress');
    return supabaseClient;
  }

  clientInitialized = true;

  // Wait for Supabase library to be available
  if (!window.supabase) {
    console.error('[SUPABASE] ❌ Supabase library not loaded! Make sure to include the CDN script.');
    console.error('[SUPABASE] window.supabase:', window.supabase);
    return null;
  }

  if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
    console.error('[SUPABASE] ❌ Supabase config missing!');
    return null;
  }

  try {
    console.log('[SUPABASE] 🔧 Initializing Supabase client...');
    
    supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.URL,
      SUPABASE_CONFIG.ANON_KEY
    );
    
    console.log('[SUPABASE] ✅ Client initialized successfully');
    console.log('[SUPABASE] Client object:', supabaseClient);
    
    return supabaseClient;
  } catch (error) {
    console.error('[SUPABASE] ❌ Failed to initialize Supabase:', error);
    console.error('[SUPABASE] Error details:', {
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Get the Supabase client instance
 * @returns {Object} Supabase client
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('[SUPABASE] Client not initialized, initializing now...');
    supabaseClient = initSupabase();
  }
  return supabaseClient;
}

/**
 * Check if Supabase library is available
 */
function isSupabaseAvailable() {
  return !!window.supabase;
}

/**
 * Wait for Supabase library to load (for async initialization)
 */
function waitForSupabase(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      if (window.supabase) {
        clearInterval(checkInterval);
        console.log('[SUPABASE] Library loaded after', Date.now() - startTime, 'ms');
        resolve(true);
      }
      
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.error('[SUPABASE] Timeout waiting for Supabase library');
        reject(new Error('Supabase library did not load in time'));
      }
    }, 100);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[SUPABASE] DOM ready, initializing client...');
    setTimeout(initSupabase, 100);
  });
} else {
  console.log('[SUPABASE] Document already loaded, initializing client...');
  setTimeout(initSupabase, 100);
}

console.log('[SUPABASE] Module initialization complete');