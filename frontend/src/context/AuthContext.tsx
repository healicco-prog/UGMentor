import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, loadUser, saveUser, clearUser, SUPER_ADMIN, DEMO_USERS } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (email.trim().toLowerCase() === SUPER_ADMIN.email.toLowerCase() && password === SUPER_ADMIN.password) {
      saveUser(SUPER_ADMIN.user);
      setUser(SUPER_ADMIN.user);
      return { success: true };
    }
    const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (demoUser && password === 'ugmentor123') {
      saveUser(demoUser);
      setUser(demoUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password.' };
  }, []);

  const logout = useCallback(() => { clearUser(); setUser(null); }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
