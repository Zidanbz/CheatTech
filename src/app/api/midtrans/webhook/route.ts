import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyMidtransSignature } from '@/lib/midtrans';
import { FieldValue } from 'firebase-admin/firestore';

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

  return NextResponse.json({ ok: true });
}
