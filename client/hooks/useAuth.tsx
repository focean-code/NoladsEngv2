import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

interface SupabaseUser {
  id: string;
  email: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

interface SupabaseSession {
  access_token: string;
  expires_at?: number;
  id: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

interface SessionData {
  id: string;
  expires_at: string;
  access_token?: string;
}

interface AuthContextType {
  user: User | null;
  session: SessionData | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  getActiveSessions: () => Promise<any[]>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify session with Supabase
  const verifySession = async (): Promise<boolean> => {
    try {
      // Check if we're on a public page first
      const isPublicPage = window.location.pathname.match(/^\/(|products|services|contact|about)$/);
      if (isPublicPage) {
        setUser(null);
        setSession(null);
        return true;
      }

      // Only check auth for admin/protected pages
      const response = await api.auth.getCurrentUser();
      
      if (response.success && response.data) {
        const supabaseUser = response.data as unknown as SupabaseUser;
        setUser({
          id: supabaseUser.id.toString(),
          email: supabaseUser.email || "",
          first_name:
            supabaseUser.user_metadata?.first_name ||
            supabaseUser.email?.split("@")[0] ||
            "",
          last_name: supabaseUser.user_metadata?.last_name || "",
          role: supabaseUser.user_metadata?.role || "admin",
          is_active: true,
        });
        setSession({
          id: supabaseUser.id.toString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        });
        return true;
      } else {
        // No valid session for protected page
        setUser(null);
        setSession(null);
        return false;
      }
    } catch (error: any) {
      console.error("Session verification error:", error);
      setUser(null);
      setSession(null);
      return false;
    }
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await verifySession();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearError = () => setError(null);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.auth.login(email, password);

      if (response.success && response.data) {
        const { user: rawUser, session: rawSession } = response.data;
        const supabaseUser = rawUser as unknown as SupabaseUser;
        const session = rawSession as unknown as SupabaseSession;

        setUser({
          id: supabaseUser.id.toString(),
          email: supabaseUser.email || "",
          first_name:
            supabaseUser.user_metadata?.first_name ||
            supabaseUser.email?.split("@")[0] ||
            "",
          last_name: supabaseUser.user_metadata?.last_name || "",
          role: supabaseUser.user_metadata?.role || "admin",
          is_active: true,
        });

        setSession({
          id: session.access_token,
          expires_at: typeof session.expires_at === 'number'
            ? new Date(session.expires_at * 1000).toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

        setIsLoading(false);
        return { success: true };
      } else {
        const errorMsg = response.error || "Login failed";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const logoutAll = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout all error:", error);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      // Note: Supabase doesn't require current password for updateUser
      // In production, you might want to implement additional verification
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const requestPasswordReset = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Password reset request error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // This would be called from a reset password page with the token from URL
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const getActiveSessions = async (): Promise<any[]> => {
    if (!user) {
      return [];
    }

    try {
      // Supabase doesn't have a direct API for getting all sessions
      // Return current session if available
      if (session) {
        return [
          {
            id: session.id,
            expires_at: session.expires_at,
            user_id: user.id,
            is_current: true,
          },
        ];
      }
      return [];
    } catch (error) {
      console.error("Get sessions error:", error);
      return [];
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    logout,
    logoutAll,
    verifySession,
    changePassword,
    requestPasswordReset,
    resetPassword,
    getActiveSessions,
    isLoading,
    isAuthenticated: !!user,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
