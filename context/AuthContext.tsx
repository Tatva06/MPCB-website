import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, UserRole } from '../types';
import { supabase } from '../services/supabase';
import { logActivity } from '../services/activityLog';

interface AuthContextType extends AuthState {
  login: (officerId: string, authorizationKey: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('officer_id, role, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !data) return null;
    return data;
  };

  // Restore session on app start
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({
            id: session.user.id,
            officerId: profile.officer_id,
            name: profile.full_name || profile.officer_id,
            role: profile.role as UserRole,
          });
        }
      }
    });
  }, []);

  const login = async (officerId: string, authorizationKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const email = `${officerId.toLowerCase()}@mpcb.gov.in`;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: authorizationKey,
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('No user returned from authentication.');

      const profile = await fetchProfile(data.user.id);
      if (!profile) throw new Error('User profile not found. Contact your system administrator.');

      setUser({
        id: data.user.id,
        officerId: profile.officer_id,
        name: profile.full_name || profile.officer_id,
        role: profile.role as UserRole,
      });

      // Log login event (after user is set)
      await logActivity('login', `Logged in as ${profile.role}`);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logActivity('logout', 'Session ended');
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
