
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { supabaseDatabaseService } from '@/services/supabaseDatabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle migration on first login
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const hasLocalData = localStorage.getItem('codecraft_conversations') || 
                                   localStorage.getItem('codecraft_preferences');
              
              if (hasLocalData) {
                console.log('Migrating data from localStorage to Supabase...');
                await supabaseDatabaseService.migrateFromLocalStorage();
              }
            } catch (error) {
              console.error('Migration failed:', error);
            }
          }, 1000);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    authService.getCurrentSession().then(session => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await authService.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
