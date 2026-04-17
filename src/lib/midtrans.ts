import crypto from 'crypto';

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const MIDTRANS_BASE_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com'
  : 'https://app.sandbox.midtrans.com';

if (!SERVER_KEY) {
  console.warn('Midtrans server key is not configured. Set MIDTRANS_SERVER_KEY.');
}

export type MidtransTransactionPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  item_details?: Array<{
    id?: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  credit_card?: {
    secure?: boolean;
  };
  expiry?: {
    unit: 'minutes' | 'hours' | 'days';
    duration: number;
  };
};

function authHeader() {
  if (!SERVER_KEY) return '';
  return 'Basic ' + Buffer.from(`${SERVER_KEY}:`).toString('base64');
}

export async function createMidtransTransaction(payload: MidtransTransactionPayload) {
  if (!SERVER_KEY) {
    throw new Error('Midtrans server key is not set. Define MIDTRANS_SERVER_KEY.');
  }

  const path = '/snap/v1/transactions';
  const body = JSON.stringify(payload);

  const response = await fetch(`${MIDTRANS_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authHeader(),
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Midtrans Snap transaction failed', {
      status: response.status,
      statusText: response.statusText,
      baseUrl: MIDTRANS_BASE_URL,
      production: IS_PRODUCTION,
      requestBody: payload,
      responseBody: text.slice(0, 2000),
    });
    throw new Error(`Midtrans transaction failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return { data } as const;
}

export function verifyMidtransSignature(options: {
  signatureKey?: string | null;
  orderId?: string | null;
  statusCode?: string | null;
  grossAmount?: string | null;
}) {
  if (!SERVER_KEY) return false;

  const { signatureKey, orderId, statusCode, grossAmount } = options;
  if (!signatureKey || !orderId || !statusCode || !grossAmount) return false;

  const raw = `${orderId}${statusCode}${grossAmount}${SERVER_KEY}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');

  const provided = signatureKey.toLowerCase();

  if (expected.length !== provided.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch (error) {
    return false;
  }
}
