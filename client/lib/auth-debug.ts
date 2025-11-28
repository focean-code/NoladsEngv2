/**
 * Authentication Debug Utilities
 * Helps debug authentication issues in development
 */

import { supabase } from './supabase';

export async function debugAuth() {
  console.log('🔍 Authentication Debug Information:');
  
  try {
    // Check current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('📱 Current Session:', {
      hasSession: !!sessionData.session,
      error: sessionError,
      user: sessionData.session?.user ? {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
        user_metadata: sessionData.session.user.user_metadata,
        app_metadata: sessionData.session.user.app_metadata
      } : null,
      accessToken: sessionData.session?.access_token ? 
        `${sessionData.session.access_token.substring(0, 20)}...` : 'None'
    });

    // Check current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('👤 Current User:', {
      hasUser: !!userData.user,
      error: userError,
      user: userData.user ? {
        id: userData.user.id,
        email: userData.user.email,
        user_metadata: userData.user.user_metadata,
        app_metadata: userData.user.app_metadata
      } : null
    });

    // Check if user exists in public.users table
    if (userData.user?.email) {
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userData.user.email)
        .maybeSingle();
      
      console.log('🗄️ Database User:', {
        found: !!dbUser,
        error: dbError,
        user: dbUser
      });
    }

    return {
      session: sessionData.session,
      user: userData.user,
      hasValidSession: !!sessionData.session,
      hasValidUser: !!userData.user
    };
  } catch (error) {
    console.error('❌ Auth debug error:', error);
    return { error };
  }
}

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  // Run debug after a short delay to ensure auth is initialized
  setTimeout(() => {
    debugAuth();
  }, 1000);
}
