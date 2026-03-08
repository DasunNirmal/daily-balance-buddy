import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, setUser as saveUser, clearUser } from '@/lib/storage';

interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getUser();
    if (stored) setUser(stored);
    setIsLoading(false);
  }, []);

  const login = (email: string, _password: string) => {
    // Simple local auth - no password validation for localStorage version
    if (email.trim()) {
      saveUser(email.trim());
      setUser({ email: email.trim() });
      return true;
    }
    return false;
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
