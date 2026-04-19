import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, firebaseAdminCredential } from '@/lib/firebase-admin';
import { createMidtransTransaction, MidtransTransactionPayload } from '@/lib/midtrans';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && !firebaseAdminCredential.hasCredential) {
      console.error('Firebase Admin credential missing in production', {
        source: firebaseAdminCredential.source,
      });
      return NextResponse.json(
        {
          message:
            'Server misconfigured: Firebase Admin credential is missing. Set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (recommended) or FIREBASE_SERVICE_ACCOUNT_JSON in Vercel Environment Variables.',
        },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get('authorization');
    let authUid: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length);
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        authUid = decoded.uid;
      } catch (error) {
        console.error('verifyIdToken failed', {
          message: (error as any)?.message,
          code: (error as any)?.code,
        });
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { productId, customerName, customerEmail, fulfillmentMode } = body ?? {};

    if (!productId || !customerName || !customerEmail) {
      return NextResponse.json({ message: 'productId, customerName, and customerEmail are required.' }, { status: 400 });
    }

    const mode: 'self' | 'assisted' = fulfillmentMode === 'assisted' ? 'assisted' : 'self';

    const productSnap = await adminDb.collection('products').doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productSnap.data() as any;
    const amount = Math.round(Number(product.price));

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbacksBase = process.env.MIDTRANS_CALLBACK_URL || `${appUrl}/sukses`;
    const callbackWithParams = `${callbacksBase}${callbacksBase.includes('?') ? '&' : '?'}orderId=${invoiceNumber}&mode=${mode}`;

    const payload: MidtransTransactionPayload = {
      transaction_details: {
        order_id: invoiceNumber,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      item_details: [
        {
          id: productId,
          name: product.name ?? 'Produk',
          price: amount,
          quantity: 1,
        },
      ],
      callbacks: {
        finish: callbackWithParams,
        error: process.env.MIDTRANS_CALLBACK_URL_ERROR || callbackWithParams,
        pending: process.env.MIDTRANS_CALLBACK_URL_PENDING || callbackWithParams,
      },
      credit_card: {
        secure: true,
      },
      expiry: {
        unit: 'minutes',
        duration: 60,
      },
    };

    const { data } = await createMidtransTransaction(payload);
    const paymentUrl = data?.redirect_url;

    if (!paymentUrl) {
      return NextResponse.json({ message: 'Failed to obtain payment URL from Midtrans.' }, { status: 502 });
    }

    await adminDb.collection('orders').add({
      customerName,
      customerEmail,
      productId,
      productName: product.name ?? '',
      price: amount,
      orderDate: FieldValue.serverTimestamp(),
      userId: authUid ?? 'anonymous',
      status: 'Pending',
       fulfillmentMode: mode,
       deliveryStatus: 'AwaitingPayment',
      invoiceNumber,
      paymentProvider: 'midtrans',
      paymentUrl,
      midtransToken: data?.token ?? null,
      midtransTransactionStatus: data?.transaction_status ?? 'pending',
    });

    return NextResponse.json({ redirectUrl: paymentUrl, invoiceNumber });
  } catch (error) {
    console.error('Midtrans checkout error', error);
    return NextResponse.json({ message: 'Unexpected error creating Midtrans transaction.' }, { status: 500 });
  }
}
