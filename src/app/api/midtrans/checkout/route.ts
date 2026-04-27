import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, firebaseAdminCredential } from '@/lib/firebase-admin';
import { createMidtransTransaction, MidtransTransactionPayload } from '@/lib/midtrans';
import { FieldValue } from 'firebase-admin/firestore';
import {
  normalizeVoucherCode,
  validateVoucherForAmount,
} from '@/lib/vouchers';

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
    const { productId, customerName, customerEmail, fulfillmentMode, voucherCode } = body ?? {};

    if (!productId || !customerName || !customerEmail) {
      return NextResponse.json({ message: 'productId, customerName, and customerEmail are required.' }, { status: 400 });
    }

    const mode: 'self' | 'assisted' = fulfillmentMode === 'assisted' ? 'assisted' : 'self';

    const productSnap = await adminDb.collection('products').doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productSnap.data() as any;
    const originalAmount = Math.max(0, Math.round(Number(product.price)));
    const normalizedVoucherCode = normalizeVoucherCode(voucherCode);
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let appliedVoucher:
      | {
          id: string;
          code: string;
          discountType: 'percentage' | 'fixed';
          discountValue: number;
        }
      | null = null;

    if (normalizedVoucherCode) {
      const voucherQuery = await adminDb
        .collection('vouchers')
        .where('code', '==', normalizedVoucherCode)
        .limit(1)
        .get();

      const voucher = voucherQuery.empty
        ? null
        : ({
            id: voucherQuery.docs[0].id,
            ...voucherQuery.docs[0].data(),
          } as any);

      const validation = validateVoucherForAmount(
        voucher,
        originalAmount,
        normalizedVoucherCode
      );

      if (!validation.isValid) {
        return NextResponse.json({ message: validation.message }, { status: 400 });
      }

      discountAmount = validation.discountAmount;
      finalAmount = validation.finalAmount;
      appliedVoucher = {
        id: validation.voucher.id,
        code: validation.voucher.code,
        discountType: validation.voucher.discountType,
        discountValue: validation.voucher.discountValue,
      };
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbacksBase = process.env.MIDTRANS_CALLBACK_URL || `${appUrl}/sukses`;
    const callbackWithParams = `${callbacksBase}${callbacksBase.includes('?') ? '&' : '?'}orderId=${invoiceNumber}&mode=${mode}`;

    const payload: MidtransTransactionPayload = {
      transaction_details: {
        order_id: invoiceNumber,
        gross_amount: finalAmount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      item_details: [
        {
          id: productId,
          name: product.name ?? 'Produk',
          price: finalAmount,
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
      price: finalAmount,
      originalPrice: originalAmount,
      discountAmount,
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
      ...(appliedVoucher
        ? {
            voucherId: appliedVoucher.id,
            voucherCode: appliedVoucher.code,
            voucherDiscountType: appliedVoucher.discountType,
            voucherDiscountValue: appliedVoucher.discountValue,
          }
        : {}),
    });

    return NextResponse.json({ redirectUrl: paymentUrl, invoiceNumber });
  } catch (error) {
    console.error('Midtrans checkout error', error);
    return NextResponse.json({ message: 'Unexpected error creating Midtrans transaction.' }, { status: 500 });
  }
}
