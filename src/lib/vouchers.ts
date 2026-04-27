import type { Voucher } from '@/lib/types';

type TimestampLike = {
  toDate?: () => Date;
} | Date | string | number | null | undefined;

export type VoucherPricingSummary = {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
};

export type VoucherValidationSuccess = VoucherPricingSummary & {
  isValid: true;
  voucher: Voucher;
  normalizedCode: string;
};

export type VoucherValidationFailure = VoucherPricingSummary & {
  isValid: false;
  message: string;
  normalizedCode: string;
};

export type VoucherValidationResult =
  | VoucherValidationSuccess
  | VoucherValidationFailure;

export function normalizeVoucherCode(code?: string | null) {
  return String(code ?? '').trim().toUpperCase();
}

function toDate(value: TimestampLike) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }

  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getVoucherWindow(voucher: Pick<Voucher, 'startDate' | 'expiryDate'>) {
  const startDate = toDate(voucher.startDate);
  const expiryDate = toDate(voucher.expiryDate);

  if (!startDate || !expiryDate) {
    return null;
  }

  const startsAt = new Date(startDate);
  startsAt.setHours(0, 0, 0, 0);

  const expiresAt = new Date(expiryDate);
  expiresAt.setHours(23, 59, 59, 999);

  return { startsAt, expiresAt };
}

export function calculateVoucherPricing(
  amount: number,
  voucher: Pick<Voucher, 'discountType' | 'discountValue'>
): VoucherPricingSummary {
  const originalAmount = Math.max(0, Math.round(Number(amount) || 0));
  const rawDiscount =
    voucher.discountType === 'percentage'
      ? Math.round((originalAmount * Number(voucher.discountValue || 0)) / 100)
      : Math.round(Number(voucher.discountValue || 0));
  const discountAmount = Math.max(0, Math.min(originalAmount, rawDiscount));
  const finalAmount = Math.max(0, originalAmount - discountAmount);

  return {
    originalAmount,
    discountAmount,
    finalAmount,
  };
}

export function validateVoucherForAmount(
  voucher: Voucher | null | undefined,
  amount: number,
  rawCode?: string | null,
  now = new Date()
): VoucherValidationResult {
  const normalizedCode = normalizeVoucherCode(rawCode ?? voucher?.code);
  const basePricing = calculateVoucherPricing(amount, {
    discountType: voucher?.discountType ?? 'fixed',
    discountValue: voucher?.discountValue ?? 0,
  });

  if (!voucher) {
    return {
      isValid: false,
      message: 'Kode voucher tidak ditemukan.',
      normalizedCode,
      ...basePricing,
    };
  }

  if (!voucher.isActive) {
    return {
      isValid: false,
      message: 'Voucher ini sedang tidak aktif.',
      normalizedCode,
      ...basePricing,
    };
  }

  const window = getVoucherWindow(voucher);
  if (!window || now < window.startsAt || now > window.expiresAt) {
    return {
      isValid: false,
      message: 'Voucher sudah tidak berlaku atau belum bisa digunakan.',
      normalizedCode,
      ...basePricing,
    };
  }

  const usageLimit = Math.max(0, Number(voucher.usageLimit || 0));
  const usageCount = Math.max(0, Number(voucher.usageCount || 0));
  if (usageLimit > 0 && usageCount >= usageLimit) {
    return {
      isValid: false,
      message: 'Voucher ini sudah mencapai batas penggunaan.',
      normalizedCode,
      ...basePricing,
    };
  }

  const minPurchase = Math.max(0, Number(voucher.minPurchase || 0));
  if (minPurchase > 0 && basePricing.originalAmount < minPurchase) {
    return {
      isValid: false,
      message: `Voucher hanya berlaku untuk pembelian minimal Rp${minPurchase.toLocaleString('id-ID')}.`,
      normalizedCode,
      ...basePricing,
    };
  }

  if (basePricing.discountAmount <= 0) {
    return {
      isValid: false,
      message: 'Voucher ini tidak memberikan potongan untuk pesanan ini.',
      normalizedCode,
      ...basePricing,
    };
  }

  return {
    isValid: true,
    voucher,
    normalizedCode,
    ...basePricing,
  };
}
