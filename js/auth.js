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

/**
 * Trigger custom auth event
 * @param {String} eventName - Event name from AUTH_EVENTS
 * @param {Object} detail - Event detail data
 */
function dispatchAuthEvent(eventName, detail = {}) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Initiate Discord OAuth login
 * Handles popup blocker errors gracefully
 */
async function loginWithDiscord() {
  const client = getSupabaseClient();
  if (!client) {
    console.error('❌ Supabase client not initialized');
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: 'Auth service unavailable' });
    return;
  }

  // Prevent duplicate login attempts
  if (authState.isLoggingIn) {
    console.warn('⚠️  Login already in progress');
    return;
  }

  authState.isLoggingIn = true;
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
  }

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: SUPABASE_CONFIG.CURRENT_REDIRECT,
        scopes: 'identify email'
      }
    });

    if (error) {
      if (error.message.includes('popup')) {
        console.error('❌ Popup was blocked by browser');
        dispatchAuthEvent(AUTH_EVENTS.ERROR, { 
          message: 'Please allow popups for Discord login',
          type: 'popup_blocked'
        });
      } else {
        console.error('❌ Discord login failed:', error.message);
        dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: error.message });
      }
    } else {
      console.log('✅ Discord OAuth initiated');
    }
  } catch (err) {
    console.error('❌ Unexpected login error:', err);
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: err.message });
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
  const client = getSupabaseClient();
  if (!client) {
    console.error('❌ Supabase client not initialized');
    return;
  }

  try {
    const { error } = await client.auth.signOut();
    
    if (error) {
      console.error('❌ Logout failed:', error.message);
      dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: error.message });
      return;
    }

    authState.currentUser = null;
    console.log('✅ User logged out');
    dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
    updateAuthUI();
  } catch (err) {
    console.error('❌ Unexpected logout error:', err);
    dispatchAuthEvent(AUTH_EVENTS.ERROR, { message: err.message });
  }
}

/**
 * Restore session from browser storage
 * Called on page load to maintain persistent authentication
 */
async function restoreSession() {
  if (authState.sessionRestored || authState.isRestoringSession) {
    return;
  }

  authState.isRestoringSession = true;
  const client = getSupabaseClient();
  
  if (!client) {
    console.error('❌ Supabase client not initialized');
    authState.sessionRestored = true;
    authState.isRestoringSession = false;
    return;
  }

  try {
    // Check for existing session
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.warn('⚠️  Could not restore session:', error.message);
      authState.sessionRestored = true;
      authState.isRestoringSession = false;
      dispatchAuthEvent(AUTH_EVENTS.SESSION_RESTORED, { user: null });
      return;
    }

    if (session && session.user) {
      authState.currentUser = session.user;
      console.log('✅ Session restored for user:', session.user.email);
      dispatchAuthEvent(AUTH_EVENTS.LOGIN, { user: session.user });
      await syncUserToDatabase(session.user);
    } else {
      console.log('ℹ️  No active session found');
    }
  } catch (err) {
    console.error('❌ Session restoration error:', err);
  } finally {
    authState.sessionRestored = true;
    authState.isRestoringSession = false;
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
  const client = getSupabaseClient();
  if (!client) {
    console.error('❌ Cannot setup auth listener - client not initialized');
    return;
  }

  // Subscribe to auth state changes
  const { data: { subscription } } = client.auth.onAuthStateChange(
    (event, session) => {
      console.log('📢 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        authState.currentUser = session.user;
        console.log('✅ User signed in:', session.user.email);
        dispatchAuthEvent(AUTH_EVENTS.LOGIN, { user: session.user });
        syncUserToDatabase(session.user);
        updateAuthUI();
      } else if (event === 'SIGNED_OUT') {
        authState.currentUser = null;
        console.log('✅ User signed out');
        dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
        updateAuthUI();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
    }
  );

  // Return unsubscribe function for cleanup if needed
  return () => subscription?.unsubscribe();
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      restoreSession();
      setupAuthListener();
    }, 100);
  });
} else {
  setTimeout(() => {
    restoreSession();
    setupAuthListener();
  }, 100);
}