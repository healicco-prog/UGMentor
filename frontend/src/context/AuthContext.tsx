import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, SubscriptionTier } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, course: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Map Supabase user to local User interface
        const role = session.user.user_metadata?.role || 'student';
        const tier = session.user.user_metadata?.tier || 'basic';
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: role as UserRole,
          tier: tier as SubscriptionTier,
          createdAt: session.user.created_at
        });
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'student';
        const tier = session.user.user_metadata?.tier || 'basic';
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: role as UserRole,
          tier: tier as SubscriptionTier,
          createdAt: session.user.created_at
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Supabase signInWithPassword threw an exception:', err);
      return { success: false, error: err?.message || 'A network or configuration error occurred.' };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, course: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: 'student',
            tier: 'premium',
            course: course
          }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Supabase signUp threw an exception:', err);
      return { success: false, error: err?.message || 'A network or configuration error occurred.' };
    }
  }, []);

  const logout = useCallback(async () => { 
    await supabase.auth.signOut();
    setUser(null); 
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
