// bKash Payment Gateway — Tokenized Checkout API

const BKASH_BASE_URL = process.env.BKASH_BASE_URL || 'https://tokenized.pay.bka.sh/v1.2.0-beta';
const BKASH_USERNAME = process.env.BKASH_USERNAME!;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD!;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY!;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://suttro.app';

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
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    }),
  });

  const data: BkashTokenResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash token error: ${data.statusMessage}`);
  }

  tokenCache = {
    token: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.id_token;
}

async function refreshToken(refreshTkn: string): Promise<string> {
  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
      refresh_token: refreshTkn,
    }),
  });

  const data: BkashTokenResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash refresh error: ${data.statusMessage}`);
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

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: invoiceNumber,
      callbackURL: `${APP_URL}/api/payment/bkash/callback?paymentId=${paymentId}`,
      amount: amount.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNumber,
    }),
  });

  const data: BkashCreatePaymentResponse = await res.json();

  if (data.statusCode !== '0000') {
    throw new Error(`bKash create error: ${data.statusMessage}`);
  }

  return data;
}

export async function executePayment(bkashPaymentID: string): Promise<BkashExecutePaymentResponse> {
  const token = await getToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID: bkashPaymentID }),
  });

  const data: BkashExecutePaymentResponse = await res.json();
  return data;
}

export async function queryPayment(bkashPaymentID: string) {
  const token = await getToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID: bkashPaymentID }),
  });

  return res.json();
}
