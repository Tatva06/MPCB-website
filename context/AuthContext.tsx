import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';

import { supabase } from '../services/supabase';

interface AuthContextType extends AuthState {
  login: (officerId: string, authorizationKey: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (officerId: string, authorizationKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const email = `${officerId}@mpcb.gov.in`.toLowerCase();
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: authorizationKey,
      });

      if (signInError) {
        throw signInError;
      }
      
      setUser({
        id: officerId,
        name: 'Authorized Officer',
        role: 'Senior Auditor',
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
