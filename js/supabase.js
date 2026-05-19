/**
 * SUPABASE CLIENT INITIALIZATION
 * 
 * This module initializes the Supabase client with the provided credentials.
 * It handles all communication with the Supabase backend.
 * 
 * Usage:
 *   const { data, error } = await supabaseClient.auth.getSession();
 */

let supabaseClient = null;

/**
 * Initialize Supabase Client
 * Must be called after config.js is loaded
 */
function initSupabase() {
  if (supabaseClient) {
    console.warn('⚠️  Supabase client already initialized');
    return supabaseClient;
  }

  if (!window.supabase) {
    console.error('❌ Supabase library not loaded! Include supabase-js before this script.');
    return null;
  }

  if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
    console.error('❌ Supabase config missing!');
    return null;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.URL,
      SUPABASE_CONFIG.ANON_KEY
    );
    console.log('✅ Supabase client initialized successfully');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return null;
  }
}

/**
 * Get the Supabase client instance
 * @returns {Object} Supabase client
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = initSupabase();
  }
  return supabaseClient;
}

/**
 * Execute database query with error handling
 * @param {Promise} query - Supabase query promise
 * @param {String} operation - Description of operation for logging
 * @returns {Object} { data, error }
 */
async function executeQuery(query, operation = 'Query') {
  try {
    const result = await query;
    if (result.error) {
      console.error(`❌ ${operation} failed:`, result.error);
      return { data: null, error: result.error };
    }
    console.log(`✅ ${operation} successful`);
    return result;
  } catch (error) {
    console.error(`❌ ${operation} error:`, error);
    return { data: null, error };
  }
}

// Initialize on script load if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}
