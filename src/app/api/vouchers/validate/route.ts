import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import {
  normalizeVoucherCode,
  validateVoucherForAmount,
} from '@/lib/vouchers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice('Bearer '.length);
    try {
      await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('verifyIdToken failed for voucher validation', {
        message: (error as any)?.message,
        code: (error as any)?.code,
      });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body?.productId ?? '').trim();
    const normalizedVoucherCode = normalizeVoucherCode(body?.voucherCode);

    if (!productId || !normalizedVoucherCode) {
      return NextResponse.json(
        { message: 'productId and voucherCode are required.' },
        { status: 400 }
      );
    }

    const productSnap = await adminDb.collection('products').doc(productId).get();
    if (!productSnap.exists) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = productSnap.data() as any;
    const amount = Math.max(0, Math.round(Number(product.price)));

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
      amount,
      normalizedVoucherCode
    );

    if (!validation.isValid) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    return NextResponse.json({
      voucher: {
        id: validation.voucher.id,
        code: validation.voucher.code,
        discountType: validation.voucher.discountType,
        discountValue: validation.voucher.discountValue,
      },
      pricing: {
        originalAmount: validation.originalAmount,
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
      },
    });
  } catch (error) {
    console.error('Voucher validation error', error);
    return NextResponse.json(
      { message: 'Unexpected error validating voucher.' },
      { status: 500 }
    );
  }
}
