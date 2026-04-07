'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Auth Context — Supabase Phone OTP
// Client created lazily inside useEffect (client-side only)
// Works without credentials in dev/build
// ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
}

interface AuthContextType extends AuthState {
  sendOTP: (phone: string) => Promise<{ error: string | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<SupabaseClient | null>(null);
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: isSupabaseConfigured,
    configured: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Create client on the client side only (inside useEffect)
    import('@supabase/supabase-js').then(({ createClient }) => {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      clientRef.current = client;

      // Get initial session
      client.auth.getSession().then(({ data: { session } }) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          configured: true,
        });
      });

      // Listen for auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange(
        (_event, session) => {
          setState({
            user: session?.user ?? null,
            session,
            loading: false,
            configured: true,
          });
        }
      );

      // Cleanup
      return () => subscription.unsubscribe();
    });
  }, []);

  const sendOTP = async (phone: string): Promise<{ error: string | null }> => {
    if (!clientRef.current) return { error: 'Auth সেটআপ হয়নি — Supabase credentials দাও' };
    const { error } = await clientRef.current.auth.signInWithOtp({ phone });
    return { error: error?.message ?? null };
  };

  const verifyOTP = async (phone: string, token: string): Promise<{ error: string | null }> => {
    if (!clientRef.current) return { error: 'Auth সেটআপ হয়নি' };
    const { error } = await clientRef.current.auth.verifyOtp({ phone, token, type: 'sms' });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!clientRef.current) return { error: 'Auth সেটআপ হয়নি — Supabase credentials দাও' };
    const { error } = await clientRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (clientRef.current) await clientRef.current.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ ...state, sendOTP, verifyOTP, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
