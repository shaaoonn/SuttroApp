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
// Auth Context — Firebase Phone OTP + Supabase Session
// Phone auth: Firebase sends OTP → verify → exchange for Supabase session
// Google auth: Supabase OAuth (web only)
// ─────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  supabase: SupabaseClient | null;
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
    supabase: null,
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
          supabase: client,
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
            supabase: client,
          });
        }
      );

      // Cleanup
      return () => subscription.unsubscribe();
    });
  }, []);

  // ── Firebase Phone OTP — Send ──
  const sendOTP = async (phone: string): Promise<{ error: string | null }> => {
    try {
      const { firebaseSendOTP, setupRecaptcha } = await import('@/lib/firebase-client');

      // Setup recaptcha if not already done
      let verifier = (window as unknown as { _suttroRecaptcha?: ReturnType<typeof setupRecaptcha> })._suttroRecaptcha;
      if (!verifier) {
        // Make sure the recaptcha container exists
        let container = document.getElementById('recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'recaptcha-container';
          document.body.appendChild(container);
        }
        verifier = setupRecaptcha('recaptcha-container');
        (window as unknown as { _suttroRecaptcha?: ReturnType<typeof setupRecaptcha> })._suttroRecaptcha = verifier;
      }

      const result = await firebaseSendOTP(phone, verifier);
      return result;
    } catch (err) {
      console.error('sendOTP error:', err);
      return { error: 'OTP পাঠাতে সমস্যা হয়েছে — আবার চেষ্টা করো' };
    }
  };

  // ── Firebase Phone OTP — Verify & Exchange for Supabase Session ──
  const verifyOTP = async (_phone: string, code: string): Promise<{ error: string | null }> => {
    try {
      const { firebaseVerifyOTP } = await import('@/lib/firebase-client');

      // Verify OTP with Firebase
      const { token: firebaseToken, error: verifyError } = await firebaseVerifyOTP(code);
      if (verifyError || !firebaseToken) {
        return { error: verifyError || 'OTP যাচাই করতে সমস্যা হয়েছে' };
      }

      // Exchange Firebase token for Supabase session
      const res = await fetch('/api/auth/firebase-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_token: firebaseToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'লগইন করতে সমস্যা হয়েছে' };
      }

      // Set the Supabase session manually
      if (clientRef.current && data.access_token && data.refresh_token) {
        await clientRef.current.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
      }

      return { error: null };
    } catch (err) {
      console.error('verifyOTP error:', err);
      return { error: 'লগইন করতে সমস্যা হয়েছে — আবার চেষ্টা করো' };
    }
  };

  // ── Google OAuth via Supabase ──
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!clientRef.current) return { error: 'Auth সেটআপ হয়নি — Supabase credentials দাও' };

    const { data, error } = await clientRef.current.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
        skipBrowserRedirect: true,
      },
    });

    if (error) return { error: error.message };

    if (data?.url) {
      window.location.href = data.url;
    }

    return { error: null };
  };

  const signOut = async () => {
    if (clientRef.current) await clientRef.current.auth.signOut();

    // Also sign out from Firebase
    try {
      const { getFirebaseAuth } = await import('@/lib/firebase-client');
      await getFirebaseAuth().signOut();
    } catch {
      // Firebase sign out failure is non-critical
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, sendOTP, verifyOTP, signInWithGoogle, signOut }}
    >
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
