const DEFAULT_ADMIN_WA_NUMBER = '085255995343';

export const ADMIN_WA_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ?? DEFAULT_ADMIN_WA_NUMBER;

function normalizeWhatsAppNumber(number: string): string {
  const digits = String(number).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

function formatWhatsAppNumberForDisplay(number: string): string {
  const raw = String(number).trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return raw;
  if (digits.startsWith('0')) return digits;
  if (digits.startsWith('62')) return `+${digits}`;
  if (digits.startsWith('8')) return `0${digits}`;
  return digits;
}

export const ADMIN_WA_NUMBER_DISPLAY = formatWhatsAppNumberForDisplay(ADMIN_WA_NUMBER);

export function buildWhatsAppLink({
  number = ADMIN_WA_NUMBER,
  message,
}: {
  number?: string;
  message: string;
}) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
