export const ADMIN_WA_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER ?? '6282290259322';

export function buildWhatsAppLink({
  number = ADMIN_WA_NUMBER,
  message,
}: {
  number?: string;
  message: string;
}) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

