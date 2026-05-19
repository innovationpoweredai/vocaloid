/**
 * AUTH UI MANAGEMENT
 * 
 * Handles UI updates based on authentication state.
 * Shows/hides different UI elements for authenticated vs guest users.
 * Displays user avatar, username, and Discord info.
 */

console.log('[UI-AUTH] Module loaded');

/**
 * Update UI based on authentication state
 * Called whenever auth state changes
 */
function updateAuthUI() {
  const user = getCurrentUser();
  const isAuth = isAuthenticated();
  const isReady = isAuthReady();

  console.log('[UI-AUTH] 🎨 Updating auth UI:', {
    isAuthenticated: isAuth,
    isReady: isReady,
    userEmail: user?.email,
    userName: user?.user_metadata?.name
  });

  // Update login button
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn) {
    if (isAuth) {
      const avatar = user.user_metadata?.avatar_url || 'https://via.placeholder.com/32';
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      
      loginBtn.innerHTML = `
        <img src="${avatar}" 
             style="width: 20px; height: 20px; border-radius: 50%; margin-right: 8px;" 
             alt="Avatar"
             onerror="this.src='https://via.placeholder.com/32'">
        ${name}
      `;
      loginBtn.onclick = logout;
      loginBtn.title = 'Click to logout';
      console.log('[UI-AUTH] ✅ Updated button to authenticated state');
    } else {
      loginBtn.innerHTML = '<i class="fab fa-discord"></i> Login Discord';
      loginBtn.onclick = loginWithDiscord;
      loginBtn.title = 'Login with Discord';
      console.log('[UI-AUTH] ✅ Updated button to guest state');
    }
  } else {
    console.warn('[UI-AUTH] ⚠️  Login button not found in DOM');
  }

  // Show/hide protected content
  updateProtectedContent(isAuth, user);
}

/**
 * Update visibility of protected content
 * @param {Boolean} isAuth - Is user authenticated
 * @param {Object} user - Current user object
 */
function updateProtectedContent(isAuth, user) {
  // Find all elements with auth-required attribute
  const protectedElements = document.querySelectorAll('[data-auth-required]');
  protectedElements.forEach(el => {
    el.style.display = isAuth ? 'block' : 'none';
  });

  // Find all elements with guest-only attribute
  const guestElements = document.querySelectorAll('[data-guest-only]');
  guestElements.forEach(el => {
    el.style.display = isAuth ? 'none' : 'block';
  });

  if (protectedElements.length > 0 || guestElements.length > 0) {
    console.log('[UI-AUTH] Updated protected content visibility');
  }

  // Update user info display
  if (isAuth && user) {
    displayUserInfo(user);
  }
}

/**
 * Display user information in UI
 * @param {Object} user - Supabase user object
 */
function displayUserInfo(user) {
  const username = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const avatar = user.user_metadata?.avatar_url || null;
  const discordId = user.user_metadata?.provider_id || user.id;

  console.log('[UI-AUTH] 👤 Displaying user info:', { username, discordId });

  // Update username displays
  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = username;
  });

  // Update avatar displays
  document.querySelectorAll('[data-user-avatar]').forEach(el => {
    if (avatar) {
      el.src = avatar;
      el.alt = username;
    }
  });

  // Update Discord ID displays
  document.querySelectorAll('[data-user-id]').forEach(el => {
    el.textContent = discordId;
  });
}

/**
 * Show loading spinner during auth
 */
function showAuthLoading() {
  const loginBtn = document.getElementById('discord-login-btn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  }
}

/**
 * Hide loading spinner
 */
function hideAuthLoading() {
  updateAuthUI();
}

/**
 * Show auth error message
 * @param {String} message - Error message
 * @param {Number} duration - Duration to show (ms)
 */
function showAuthError(message, duration = 5000) {
  console.error('[UI-AUTH] ❌ Auth error:', message);
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: 'Space Grotesk';
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    max-width: 300px;
  `;
  toast.textContent = '❌ ' + message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show success message
 * @param {String} message - Success message
 */
function showAuthSuccess(message, duration = 3000) {
  console.log('[UI-AUTH] ✅ Success:', message);
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 242, 234, 0.9);
    color: #000;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: 'Space Grotesk';
    font-weight: 700;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 10px 30px rgba(0, 242, 234, 0.3);
    max-width: 300px;
  `;
  toast.textContent = '✅ ' + message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* Listen to auth events */
window.addEventListener(AUTH_EVENTS.LOGIN, (e) => {
  console.log('[UI-AUTH] 🎉 Login event received');
  showAuthSuccess('Logged in successfully!');
  updateAuthUI();
});

window.addEventListener(AUTH_EVENTS.LOGOUT, () => {
  console.log('[UI-AUTH] 👋 Logout event received');
  showAuthSuccess('Logged out successfully');
  updateAuthUI();
});

window.addEventListener(AUTH_EVENTS.ERROR, (e) => {
  console.error('[UI-AUTH] ⚠️  Auth error event:', e.detail.message);
  showAuthError(e.detail.message);
});

window.addEventListener(AUTH_EVENTS.SESSION_RESTORED, () => {
  console.log('[UI-AUTH] 🔄 Session restoration complete');
  updateAuthUI();
  hideAuthLoading();
});

/* Add CSS animations for toast notifications */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('[UI-AUTH] Module initialization complete');