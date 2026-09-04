import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Authorized admin roles for Ravan CMS Control Panel
const AUTHORIZED_ADMIN_ROLES = ['super_admin', 'admin'];

// Explicit authorized administrative domains/emails
const AUTHORIZED_ADMIN_EMAILS = [
  'admin@ravantechnologies.com',
  'founder@ravantechnologies.com',
  'ceo@ravantechnologies.com',
  'contact@ravantechnologies.com'
];

function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (AUTHORIZED_ADMIN_EMAILS.includes(clean)) return true;
  if (clean.endsWith('@ravantechnologies.com')) return true;
  return false;
}

async function resolveAuthorizedUser(userId: string, defaultEmail: string, metadata: any): Promise<User | null> {
  const cleanEmail = (defaultEmail || '').trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Query public.profiles as single source of truth for user role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        if (!AUTHORIZED_ADMIN_ROLES.includes(profile.role)) {
          // Reject non-admin profiles (e.g. viewer, anonymous, unauthorized)
          return null;
        }
        return {
          id: profile.id,
          email: profile.email || cleanEmail,
          name: profile.full_name || cleanEmail.split('@')[0].toUpperCase() || 'Administrator',
          role: profile.role as User['role'],
          avatar_url: profile.avatar_url || '/images/ravan-logo.png'
        };
      } else if (error && (error.code === 'PGRST116' || error.message.includes('0 rows'))) {
        // Profile does not exist yet. Only provision if email is explicitly an authorized admin email!
        if (isAuthorizedAdminEmail(cleanEmail)) {
          const initialRole: User['role'] = 'super_admin';
          const initialName = metadata?.full_name || cleanEmail.split('@')[0].toUpperCase() || 'Executive Administrator';
          try {
            await supabase.from('profiles').upsert([{
              id: userId,
              email: cleanEmail,
              full_name: initialName,
              role: initialRole
            }]);
          } catch (insertErr) {
            if (import.meta.env.DEV) console.warn('Profile provisioning note:', insertErr);
          }
          return {
            id: userId,
            email: cleanEmail,
            name: initialName,
            role: initialRole,
            avatar_url: '/images/ravan-logo.png'
          };
        } else {
          // Strictly reject unauthorized arbitrary users
          if (import.meta.env.DEV) console.warn(`Unauthorized login attempt rejected for non-admin email: ${cleanEmail}`);
          return null;
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Profiles query exception:', err);
    }
  }

  // 2. Fallback check: Only authorized admin emails can be authenticated
  if (isAuthorizedAdminEmail(cleanEmail)) {
    const metaRole = (metadata?.role && AUTHORIZED_ADMIN_ROLES.includes(metadata.role) ? metadata.role : 'admin') as User['role'];
    return {
      id: userId,
      email: cleanEmail,
      name: metadata?.full_name || cleanEmail.split('@')[0].toUpperCase() || 'Administrator',
      role: metaRole,
      avatar_url: metadata?.avatar_url || '/images/ravan-logo.png'
    };
  }

  // Explicitly deny any other user
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and subscribe to real Supabase Auth session
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user && mounted) {
            const authorizedUser = await resolveAuthorizedUser(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata || session.user.app_metadata
            );

            if (authorizedUser) {
              setUser(authorizedUser);
            } else {
              // Non-admin authenticated user: Deny CMS access
              await supabase.auth.signOut();
              setUser(null);
            }
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error('Supabase session initialization error:', err);
        }
      }
      if (mounted) setLoading(false);
    };

    initializeAuth();

    // Listen to real-time Supabase Auth state changes (token refresh, logout, session expiration)
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const authorizedUser = await resolveAuthorizedUser(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata || session.user.app_metadata
          );

          if (authorizedUser) {
            setUser(authorizedUser);
          } else {
            if (supabase) {
              await supabase.auth.signOut();
            }
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      authListener = data;
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email address and password are required.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: 'Supabase backend is not configured. Please verify environment credentials.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Invalid email or password. Please verify your credentials.'
        };
      }

      if (data?.user) {
        const authorizedUser = await resolveAuthorizedUser(
          data.user.id,
          data.user.email || cleanEmail,
          data.user.user_metadata || data.user.app_metadata
        );

        // Strict Authorization Gate: Reject non-admin authenticated users
        if (!authorizedUser) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access Denied: Your account does not have administrative privileges for Ravan CMS.'
          };
        }

        setUser(authorizedUser);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed. No user returned from authentication service.' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'A network error occurred during authentication. Please try again.'
      };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        if (import.meta.env.DEV) console.error('Error during Supabase signout:', err);
      }
    }
    // Deep purge all local and session storage tokens
    try {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.startsWith('ravan_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        sessionStorage.clear();
      }
    } catch {}

    const { dataService } = await import('../lib/dataService');
    await dataService.clearCache();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
