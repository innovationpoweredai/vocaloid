/**
 * AUTHENTICATION MODULE
 * 
 * Handles Discord OAuth login, logout, and session management.
 * Uses Supabase Auth for production-stable authentication.
 * 
 * Key Features:
 * - Discord OAuth login
 * - Automatic session restoration
 * - Prevents duplicate login calls
 * - Graceful error handling
 * - Popup blocker detection
 */

let authState = {
  isLoggingIn: false,
  isRestoringSession: false,
  currentUser: null,
  sessionRestored: false
};

const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  SESSION_RESTORED: 'auth:session-restored',
  ERROR: 'auth:error'
};

console.log('[AUTH] Module loaded, authState initialized');

/**
 * Trigger custom auth event
 * @param {String} eventName - Event name from AUTH_EVENTS
 * @param {Object} detail - Event detail data
 */
function dispatchAuthEvent(eventName, detail = {}) {
  console.log('[AUTH] 📢 Dispatching event:', eventName, detail);
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Initiate Discord OAuth login
 * Handles popup blocker errors gracefully
 */
async function loginWithDiscord() {
  console.log('[AUTH] 🔐 Login requested');
  
  const client = getSupabaseClient();
  if (!client) {
    console.error('[AUTH] ❌ Supabase client not initialized');
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: 'Auth service unavailable' });
    return;
  }

  // Prevent duplicate login attempts
  if (authState.isLoggingIn) {
    console.warn('[AUTH] ⚠️  Login already in progress');
    return;
  }

  authState.isLoggingIn = true;
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  }

  try {
    console.log('[AUTH] 🌐 Initiating Discord OAuth with redirect:', SUPABASE_CONFIG.CURRENT_REDIRECT);
    
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: SUPABASE_CONFIG.CURRENT_REDIRECT,
        scopes: 'identify email'
      }
    });

    if (error) {
      console.error('[AUTH] ❌ OAuth error:', error);
      
      if (error.message && error.message.includes('popup')) {
        console.error('[AUTH] ❌ Popup was blocked by browser');
        dispatchAuthEvent(AUTH_EVENTS.ERROR, { 
          message: 'Please allow popups for Discord login',
          type: 'popup_blocked'
        });
      } else {
        console.error('[AUTH] ❌ Discord login failed:', error.message);
        dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: error.message });
      }
    } else {
      console.log('[AUTH] ✅ Discord OAuth initiated successfully');
      console.log('[AUTH] OAuth response:', data);
    }
  } catch (err) {
    console.error('[AUTH] ❌ Unexpected login error:', err);
    console.error('[AUTH] Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: err.message || 'Unknown error' });
  } finally {
    authState.isLoggingIn = false;
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fab fa-discord"></i> Login Discord';
    }
  }
}

/**
 * Logout current user
 */
async function logout() {
  console.log('[AUTH] 🚪 Logout requested');
  
  const client = getSupabaseClient();
  if (!client) {
    console.error('[AUTH] ❌ Supabase client not initialized');
    return;
  }

  try {
    const { error } = await client.auth.signOut();
    
    if (error) {
      console.error('[AUTH] ❌ Logout failed:', error.message);
      dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: error.message });
      return;
    }

    authState.currentUser = null;
    console.log('[AUTH] ✅ User logged out');
    dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
    updateAuthUI();
  } catch (err) {
    console.error('[AUTH] ❌ Unexpected logout error:', err);
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: err.message });
  }
}

/**
 * Restore session from browser storage
 * Called on page load to maintain persistent authentication
 */
async function restoreSession() {
  console.log('[AUTH] 🔄 Attempting to restore session...');
  
  if (authState.sessionRestored || authState.isRestoringSession) {
    console.warn('[AUTH] ⚠️  Session restoration already in progress or completed');
    return;
  }

  authState.isRestoringSession = true;
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('[AUTH] ❌ Supabase client not initialized');
    authState.sessionRestored = true;
    authState.isRestoringSession = false;
    dispatchAuthEvent(AUTH_EVENTS.SESSION_RESTORED, { user: null });
    return;
  }

  try {
    console.log('[AUTH] 🔍 Checking for existing session...');
    
    // Check for existing session
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.warn('[AUTH] ⚠️  Could not restore session:', error.message);
      authState.sessionRestored = true;
      authState.isRestoringSession = false;
      dispatchAuthEvent(AUTH_EVENTS.SESSION_RESTORED, { user: null });
      return;
    }

    if (session && session.user) {
      authState.currentUser = session.user;
      console.log('[AUTH] ✅ Session restored for user:', session.user.email);
      console.log('[AUTH] User metadata:', session.user.user_metadata);
      dispatchAuthEvent(AUTH_EVENTS.LOGIN, { user: session.user });
      
      // Sync user to database
      if (typeof syncUserToDatabase === 'function') {
        syncUserToDatabase(session.user);
      }
    } else {
      console.log('[AUTH] ℹ️  No active session found');
    }
  } catch (err) {
    console.error('[AUTH] ❌ Session restoration error:', err);
    console.error('[AUTH] Error details:', {
      message: err.message,
      stack: err.stack
    });
  } finally {
    authState.sessionRestored = true;
    authState.isRestoringSession = false;
    console.log('[AUTH] ✅ Session restoration complete');
    dispatchAuthEvent(AUTH_EVENTS.SESSION_RESTORED, { user: authState.currentUser });
    updateAuthUI();
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} User object or null if not authenticated
 */
function getCurrentUser() {
  return authState.currentUser;
}

/**
 * Check if user is authenticated
 * @returns {Boolean}
 */
function isAuthenticated() {
  return authState.currentUser !== null && authState.sessionRestored;
}

/**
 * Check if authentication system is ready
 * @returns {Boolean}
 */
function isAuthReady() {
  return authState.sessionRestored && !authState.isRestoringSession;
}

/**
 * Listen to authentication state changes
 * This runs for the lifetime of the page
 */
function setupAuthListener() {
  console.log('[AUTH] 🎧 Setting up auth state listener...');
  
  const client = getSupabaseClient();
  if (!client) {
    console.error('[AUTH] ❌ Cannot setup auth listener - client not initialized');
    return;
  }

  // Subscribe to auth state changes
  const { data: { subscription } } = client.auth.onAuthStateChange(
    (event, session) => {
      console.log('[AUTH] 📢 Auth state changed:', event);
      console.log('[AUTH] Session:', session ? 'Active' : 'None');

      if (event === 'SIGNED_IN' && session) {
        authState.currentUser = session.user;
        console.log('[AUTH] ✅ User signed in:', session.user.email);
        dispatchAuthEvent(AUTH_EVENTS.LOGIN, { user: session.user });
        
        if (typeof syncUserToDatabase === 'function') {
          syncUserToDatabase(session.user);
        }
        
        updateAuthUI();
      } else if (event === 'SIGNED_OUT') {
        authState.currentUser = null;
        console.log('[AUTH] ✅ User signed out');
        dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
        updateAuthUI();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[AUTH] 🔄 Token refreshed');
      }
    }
  );

  console.log('[AUTH] ✅ Auth state listener setup complete');
  return () => subscription?.unsubscribe();
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[AUTH] DOM ready, initializing auth system...');
    setTimeout(() => {
      restoreSession();
      setupAuthListener();
    }, 200);
  });
} else {
  console.log('[AUTH] Document already loaded, initializing auth system...');
  setTimeout(() => {
    restoreSession();
    setupAuthListener();
  }, 200);
}

console.log('[AUTH] Module initialization complete');