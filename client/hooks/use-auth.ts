import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setAuthState(prev => ({ ...prev, error, loading: false }));
        return;
      }
      
      if (session?.user) {
        checkAdminStatus(session.user);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        checkAdminStatus(session.user);
      } else {
        setAuthState({
          user: null,
          isAdmin: false,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (user: User) => {
    try {
      // First check user metadata
      const metaRole = (user.user_metadata?.role || user.app_metadata?.role || '').toLowerCase();
      if (metaRole === 'admin') {
        setAuthState({
          user,
          isAdmin: true,
          loading: false,
          error: null,
        });
        return;
      }

      // Then check users table
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (error) throw error;

      setAuthState({
        user,
        isAdmin: (data?.role || '').toLowerCase() === 'admin',
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        user,
        isAdmin: false,
        loading: false,
        error: error as Error,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as Error }));
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setAuthState(prev => ({ ...prev, error: error as Error }));
    }
  };

  // Function to get the current access token
  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  return {
    user: authState.user,
    isAdmin: authState.isAdmin,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    getAccessToken,
  };
}
