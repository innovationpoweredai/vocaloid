/**
 * SESSION & DATABASE MANAGEMENT
 * 
 * Handles user data synchronization with Supabase database.
 * Creates/updates user records when they authenticate.
 */

console.log('[SESSION] Module loaded');

/**
 * Sync user to database
 * Creates new user record or updates last_login if exists
 * 
 * @param {Object} user - Supabase user object from auth.getSession()
 */
async function syncUserToDatabase(user) {
  if (!user) {
    console.warn('[SESSION] ⚠️  Cannot sync: no user provided');
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    console.error('[SESSION] ❌ Supabase client not available');
    return;
  }

  try {
    // Extract Discord user info from user metadata
    const discordId = user.user_metadata?.provider_id || user.id;
    const username = user.user_metadata?.name || user.email?.split('@')[0] || 'Unnamed';
    const avatarUrl = user.user_metadata?.avatar_url || null;
    const email = user.email || null;

    console.log('[SESSION] 📝 Syncing user to database:', {
      discordId,
      username,
      email,
      avatarUrl
    });

    // Try to insert new user
    const { data: insertData, error: insertError } = await client
      .from('users')
      .insert([
        {
          discord_id: discordId,
          username: username,
          email: email,
          avatar_url: avatarUrl,
          xp: 0,
          badges: []
        }
      ])
      .select()
      .single();

    // If insert fails with duplicate, update last_login
    if (insertError) {
      if (insertError.code === '23505') {
        console.log('[SESSION] ℹ️  User exists, updating last_login...');
        
        const { data: updateData, error: updateError } = await client
          .from('users')
          .update({
            last_login: new Date().toISOString(),
            avatar_url: avatarUrl,
            username: username
          })
          .eq('discord_id', discordId)
          .select()
          .single();

        if (updateError) {
          console.error('[SESSION] ❌ Failed to update user:', updateError.message);
          return { data: null, error: updateError };
        }

        console.log('[SESSION] ✅ User updated:', updateData);
        return { data: updateData, error: null };
      } else {
        console.error('[SESSION] ❌ Failed to sync user:', insertError.message);
        console.error('[SESSION] Error code:', insertError.code);
        return { data: null, error: insertError };
      }
    }

    console.log('[SESSION] ✅ New user created:', insertData);
    return { data: insertData, error: null };
  } catch (error) {
    console.error('[SESSION] ❌ Unexpected sync error:', error);
    console.error('[SESSION] Error details:', {
      message: error.message,
      stack: error.stack
    });
    return { data: null, error };
  }
}

/**
 * Get user profile from database
 * @param {String} discordId - Discord user ID
 * @returns {Object} { data, error }
 */
async function getUserProfile(discordId) {
  const client = getSupabaseClient();
  if (!client) {
    console.error('[SESSION] ❌ Supabase client not available');
    return { data: null, error: new Error('Client unavailable') };
  }

  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (error) {
      console.error('[SESSION] ❌ Failed to fetch profile:', error.message);
      return { data: null, error };
    }

    console.log('[SESSION] ✅ Profile fetched:', data);
    return { data, error: null };
  } catch (error) {
    console.error('[SESSION] ❌ Unexpected error fetching profile:', error);
    return { data: null, error };
  }
}

/**
 * Update user XP
 * @param {String} discordId - Discord user ID
 * @param {Number} xpAmount - XP to add
 */
async function addUserXP(discordId, xpAmount) {
  const client = getSupabaseClient();
  if (!client) {
    console.error('[SESSION] ❌ Supabase client not available');
    return { data: null, error: new Error('Client unavailable') };
  }

  try {
    // First get current XP
    const { data: user, error: fetchError } = await client
      .from('users')
      .select('xp')
      .eq('discord_id', discordId)
      .single();

    if (fetchError) {
      console.error('[SESSION] ❌ Failed to fetch user XP:', fetchError.message);
      return { data: null, error: fetchError };
    }

    const newXP = (user.xp || 0) + xpAmount;

    const { data, error } = await client
      .from('users')
      .update({ xp: newXP })
      .eq('discord_id', discordId)
      .select()
      .single();

    if (error) {
      console.error('[SESSION] ❌ Failed to update XP:', error.message);
      return { data: null, error };
    }

    console.log('[SESSION] ✅ XP updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('[SESSION] ❌ Unexpected error updating XP:', error);
    return { data: null, error };
  }
}

console.log('[SESSION] Module initialization complete');