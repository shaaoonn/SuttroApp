// bKash Payment Gateway — Tokenized Checkout API
// IMPORTANT: We import from 'node:process' to bypass Turbopack's
// compile-time inlining of process.env values. Without this,
// env vars are replaced with empty strings during Docker build
// (where the secrets aren't available).
import { env as processEnv } from 'node:process';

function env(key: string, fallback = ''): string {
  return processEnv[key] || fallback;
}

function getConfig() {
  return {
    baseUrl: env('BKASH_BASE_URL', 'https://tokenized.pay.bka.sh/v1.2.0-beta'),
    username: env('BKASH_USERNAME'),
    password: env('BKASH_PASSWORD'),
    appKey: env('BKASH_APP_KEY'),
    appSecret: env('BKASH_APP_SECRET'),
    appUrl: env('NEXT_PUBLIC_APP_URL', 'https://suttro.app'),
  };
}

function validateCredentials() {
  const cfg = getConfig();
  const missing: string[] = [];
  if (!cfg.username) missing.push('BKASH_USERNAME');
  if (!cfg.password) missing.push('BKASH_PASSWORD');
  if (!cfg.appKey) missing.push('BKASH_APP_KEY');
  if (!cfg.appSecret) missing.push('BKASH_APP_SECRET');
  if (missing.length > 0) {
    throw new Error(`bKash কনফিগারেশন অসম্পূর্ণ — সার্ভারে ${missing.join(', ')} সেট করা হয়নি।`);
  }
  return cfg;
}

interface BkashTokenResponse {
  statusCode: string;
  statusMessage: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface BkashCreatePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  bkashURL: string;
  callbackURL: string;
  successCallbackURL: string;
  failureCallbackURL: string;
  cancelledCallbackURL: string;
  amount: string;
  intent: string;
  currency: string;
  paymentCreateTime: string;
  transactionStatus: string;
  merchantInvoiceNumber: string;
}

interface BkashExecutePaymentResponse {
  statusCode: string;
  statusMessage: string;
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  customerMsisdn: string;
  paymentExecuteTime: string;
}

// Token cache
let tokenCache: { token: string; refreshToken: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  // Try refresh if we have a refresh token
  if (tokenCache?.refreshToken) {
    try {
      return await refreshToken(tokenCache.refreshToken);
    } catch {
      // Fall through to grant token
    }
  }

  return await grantToken();
}

async function grantToken(): Promise<string> {
  const cfg = validateCredentials();

  const res = await fetch(`${cfg.baseUrl}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: cfg.username,
      password: cfg.password,
    },
    body: JSON.stringify({
      app_key: cfg.appKey,
      app_secret: cfg.appSecret,
    }),
  });

  const data: BkashTokenResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash টোকেন ত্রুটি (${data.statusCode || 'unknown'}): ${data.statusMessage || 'সার্ভার থেকে কোনো বার্তা পাওয়া যায়নি'}`);
  }

  tokenCache = {
    token: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.id_token;
}

async function refreshToken(refreshTkn: string): Promise<string> {
  const cfg = getConfig();

  const res = await fetch(`${cfg.baseUrl}/tokenized/checkout/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: cfg.username,
      password: cfg.password,
    },
    body: JSON.stringify({
      app_key: cfg.appKey,
      app_secret: cfg.appSecret,
      refresh_token: refreshTkn,
    }),
  });

  const data: BkashTokenResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash রিফ্রেশ ত্রুটি (${data.statusCode || 'unknown'}): ${data.statusMessage || 'সার্ভার থেকে কোনো বার্তা পাওয়া যায়নি'}`);
  }

  tokenCache = {
    token: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.id_token;
}

export async function createPayment(
  amount: number,
  invoiceNumber: string,
  paymentId: string
): Promise<BkashCreatePaymentResponse> {
  const token = await getToken();

  const cfg = getConfig();

  const res = await fetch(`${cfg.baseUrl}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': cfg.appKey,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: invoiceNumber,
      callbackURL: `${cfg.appUrl}/api/payment/bkash/callback?paymentId=${paymentId}`,
      amount: amount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNumber,
    }),
  });

  const data: BkashCreatePaymentResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash পেমেন্ট তৈরি ত্রুটি (${data.statusCode || 'unknown'}): ${data.statusMessage || 'সার্ভার থেকে কোনো বার্তা পাওয়া যায়নি'}`);
  }

  return data;
}

export async function executePayment(bkashPaymentID: string): Promise<BkashExecutePaymentResponse> {
  const token = await getToken();

  const cfg = getConfig();

  const res = await fetch(`${cfg.baseUrl}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': cfg.appKey,
    },
    body: JSON.stringify({ paymentID: bkashPaymentID }),
  });

  const data: BkashExecutePaymentResponse = await res.json();
  return data;
}

export async function queryPayment(bkashPaymentID: string) {
  const token = await getToken();

  const cfg = getConfig();

  const res = await fetch(`${cfg.baseUrl}/tokenized/checkout/payment/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': cfg.appKey,
    },
    body: JSON.stringify({ paymentID: bkashPaymentID }),
  });

  return res.json();
}
