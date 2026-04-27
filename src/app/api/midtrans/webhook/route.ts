import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { FieldValue } from 'firebase-admin/firestore';
import { sendOrderReceiptEmail } from '@/lib/mailer';
import { ADMIN_WA_NUMBER_DISPLAY, buildWhatsAppLink } from '@/lib/whatsapp';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const signatureKey = payload?.signature_key;
  const orderId = payload?.order_id;
  const statusCode = payload?.status_code;
  const grossAmount = payload?.gross_amount;

  const isValid = verifyMidtransSignature({
    signatureKey,
    orderId,
    statusCode,
    grossAmount,
  });

  if (!isValid) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  if (!orderId) {
    return NextResponse.json({ message: 'Missing order_id' }, { status: 400 });
  }

  const orders = await adminDb
    .collection('orders')
    .where('invoiceNumber', '==', orderId)
    .limit(1)
    .get();

  if (orders.empty) {
    return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  }

  const transactionStatus = payload?.transaction_status as string | undefined;
  const fraudStatus = payload?.fraud_status as string | undefined;

  let status: 'Completed' | 'Pending' | 'Processed' = 'Processed';
  let deliveryStatus: 'AwaitingPayment' | 'AwaitingSetup' | 'InProgress' | 'ReadyToDeliver' | 'Delivered' | null = null;

  const orderData = orders.docs[0].data() as any;
  const fulfillmentMode = orderData?.fulfillmentMode as 'self' | 'assisted' | undefined;

  switch (transactionStatus) {
    case 'capture':
      status = fraudStatus === 'challenge' ? 'Pending' : 'Completed';
      deliveryStatus = status === 'Completed'
        ? (fulfillmentMode === 'assisted' ? 'AwaitingSetup' : 'ReadyToDeliver')
        : 'AwaitingPayment';
      break;
    case 'settlement':
      status = 'Completed';
      deliveryStatus = fulfillmentMode === 'assisted' ? 'AwaitingSetup' : 'ReadyToDeliver';
      break;
    case 'pending':
      status = 'Pending';
      deliveryStatus = 'AwaitingPayment';
      break;
    case 'cancel':
    case 'expire':
    case 'deny':
    case 'failure':
      status = 'Processed';
      deliveryStatus = 'InProgress';
      break;
    default:
      status = 'Processed';
  }

  const orderRef = orders.docs[0].ref;

  await orderRef.update({
    status,
    ...(deliveryStatus ? { deliveryStatus } : {}),
    midtransTransactionId: payload?.transaction_id ?? null,
    midtransTransactionStatus: transactionStatus ?? null,
    midtransPaymentType: payload?.payment_type ?? null,
    midtransFraudStatus: fraudStatus ?? null,
    processedAt: FieldValue.serverTimestamp(),
    midtransNotificationRaw: payload,
  });

  if (status === 'Completed' && orderData?.voucherId) {
    await adminDb.runTransaction(async (tx) => {
      const freshOrderSnap = await tx.get(orderRef);
      const freshOrder = freshOrderSnap.data() as any;

      if (!freshOrder?.voucherId || freshOrder?.voucherUsageRecordedAt) {
        return;
      }

      const voucherRef = adminDb.collection('vouchers').doc(String(freshOrder.voucherId));
      const voucherSnap = await tx.get(voucherRef);

      if (voucherSnap.exists) {
        tx.update(voucherRef, {
          usageCount: FieldValue.increment(1),
        });
      }

      tx.update(orderRef, {
        voucherUsageRecordedAt: FieldValue.serverTimestamp(),
      });
    });
  }

  if (status === 'Completed' && orderData?.customerEmail) {
    const supportEmail = 'cheattech.id@gmail.com';
    const waSupportMessage = [
      'Halo CheatTech, saya butuh bantuan terkait pesanan.',
      `Order ID: ${orderId}`,
      orderData?.customerName ? `Nama: ${orderData.customerName}` : null,
      orderData?.customerEmail ? `Email: ${orderData.customerEmail}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const supportWhatsAppLink = buildWhatsAppLink({ message: waSupportMessage });

    const shouldSend = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(orderRef);
      const fresh = snap.data() as any;
      if (!fresh) return false;
      if (fresh.receiptEmailSentAt) return false;
      if (fresh.receiptEmailStatus === 'sending') {
        const attemptedAtMs = typeof fresh.receiptEmailAttemptedAt?.toMillis === 'function'
          ? fresh.receiptEmailAttemptedAt.toMillis()
          : null;
        const isStale = typeof attemptedAtMs === 'number' ? Date.now() - attemptedAtMs > 30 * 60 * 1000 : false;
        if (!isStale) return false;
      }
      if (fresh.receiptEmailStatus === 'sent') return false;
      tx.update(orderRef, {
        receiptEmailStatus: 'sending',
        receiptEmailAttemptedAt: FieldValue.serverTimestamp(),
        receiptEmailLastError: FieldValue.delete(),
      });
      return true;
    });

    if (shouldSend) {
      try {
        await sendOrderReceiptEmail({
          to: String(orderData.customerEmail),
          customerName: String(orderData.customerName ?? '-'),
          customerEmail: String(orderData.customerEmail),
          orderId: String(orderId),
          productName: String(orderData.productName ?? 'Produk'),
          price: Number(orderData.price ?? 0),
          paymentStatus: 'Paid',
          supportEmail,
          supportWhatsAppNumberDisplay: ADMIN_WA_NUMBER_DISPLAY,
          supportWhatsAppLink,
        });

        await orderRef.update({
          receiptEmailStatus: 'sent',
          receiptEmailSentAt: FieldValue.serverTimestamp(),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Failed sending receipt email', { orderId, message });
        await orderRef.update({
          receiptEmailStatus: 'failed',
          receiptEmailLastError: message,
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
