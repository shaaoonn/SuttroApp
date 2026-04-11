// ─────────────────────────────────────────────
// Firebase Client SDK — Phone Authentication
// Used for sending OTP via Firebase (free 10k/month)
// ─────────────────────────────────────────────

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCTt81TgnAkT_BkIO87P4u7WA7yI9P2lqQ',
  authDomain: 'suttro-5c3cd.firebaseapp.com',
  projectId: 'suttro-5c3cd',
  storageBucket: 'suttro-5c3cd.firebasestorage.app',
  messagingSenderId: '209048026817',
  appId: '1:209048026817:web:076368d8434bbfc7bc5e40',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);
    auth.languageCode = 'bn'; // Bengali
  }
  return auth;
}

// Store confirmation result for OTP verification
let confirmationResult: ConfirmationResult | null = null;

/**
 * Setup invisible reCAPTCHA verifier
 * Must be called before sendOTP
 */
export function setupRecaptcha(buttonId: string): RecaptchaVerifier {
  const authInstance = getFirebaseAuth();
  const verifier = new RecaptchaVerifier(authInstance, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved — will proceed with sendOTP
    },
  });
  return verifier;
}

/**
 * Send OTP to phone number via Firebase
 * @param phone Full phone number with country code (e.g., +8801XXXXXXXXX)
 * @param verifier RecaptchaVerifier instance
 */
export async function firebaseSendOTP(
  phone: string,
  verifier: RecaptchaVerifier
): Promise<{ error: string | null }> {
  try {
    const authInstance = getFirebaseAuth();
    confirmationResult = await signInWithPhoneNumber(authInstance, phone, verifier);
    return { error: null };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase sendOTP error:', error);

    // User-friendly error messages in Bengali
    const errorMessages: Record<string, string> = {
      'auth/invalid-phone-number': 'সঠিক ফোন নম্বর দাও',
      'auth/too-many-requests': 'অনেকবার চেষ্টা করেছো — কিছুক্ষণ পর আবার চেষ্টা করো',
      'auth/quota-exceeded': 'আজকের SMS সীমা শেষ — কাল আবার চেষ্টা করো',
      'auth/captcha-check-failed': 'reCAPTCHA ভেরিফিকেশন ব্যর্থ — পেজ রিফ্রেশ করো',
      'auth/missing-phone-number': 'ফোন নম্বর দাও',
    };

    return {
      error: errorMessages[error.code || ''] || error.message || 'OTP পাঠাতে সমস্যা হয়েছে',
    };
  }
}

/**
 * Verify OTP code entered by user
 * Returns Firebase ID token on success
 */
export async function firebaseVerifyOTP(
  code: string
): Promise<{ token: string | null; error: string | null }> {
  if (!confirmationResult) {
    return { token: null, error: 'আগে OTP পাঠাও' };
  }

  try {
    const result = await confirmationResult.confirm(code);
    const idToken = await result.user.getIdToken();
    return { token: idToken, error: null };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase verifyOTP error:', error);

    const errorMessages: Record<string, string> = {
      'auth/invalid-verification-code': 'ভুল OTP — আবার চেষ্টা করো',
      'auth/code-expired': 'OTP মেয়াদ শেষ — আবার পাঠাও',
      'auth/session-expired': 'সেশন মেয়াদ শেষ — আবার OTP পাঠাও',
    };

    return {
      token: null,
      error: errorMessages[error.code || ''] || 'OTP যাচাই করতে সমস্যা হয়েছে',
    };
  }
}
