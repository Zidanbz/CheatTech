type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const user = process.env.SMTP_USER ?? '';
  const pass = process.env.SMTP_PASS ?? '';
  const host = process.env.SMTP_HOST ?? (user.endsWith('@gmail.com') ? 'smtp.gmail.com' : '');
  const port = Number(process.env.SMTP_PORT ?? (host === 'smtp.gmail.com' ? 465 : 0));
  const secure =
    typeof process.env.SMTP_SECURE === 'string'
      ? process.env.SMTP_SECURE === 'true'
      : host === 'smtp.gmail.com'
        ? true
        : port === 465;

  const from = process.env.MAIL_FROM ?? (user ? `CheatTech <${user}>` : 'CheatTech');

  return { host, port, secure, user, pass, from };
}

function assertSmtpConfig(config: ReturnType<typeof getSmtpConfig>) {
  if (!config.user || !config.pass) {
    throw new Error('Missing SMTP_USER or SMTP_PASS.');
  }
  if (!config.host) {
    throw new Error('Missing SMTP_HOST (or SMTP_USER must be a Gmail address to use default smtp.gmail.com).');
  }
  if (!config.port) {
    throw new Error('Missing/invalid SMTP_PORT.');
  }
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const config = getSmtpConfig();
  assertSmtpConfig(config);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    ...(text ? { text } : {}),
    html,
  });
}

export async function sendOrderReceiptEmail(params: {
  to: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  price: number;
  paymentStatus: string;
  supportEmail: string;
  supportWhatsAppNumberDisplay: string;
  supportWhatsAppLink: string;
}) {
  const {
    to,
    customerName,
    customerEmail,
    orderId,
    productName,
    price,
    paymentStatus,
    supportEmail,
    supportWhatsAppNumberDisplay,
    supportWhatsAppLink,
  } = params;

  const formattedPrice = new Intl.NumberFormat('id-ID').format(Math.round(Number(price) || 0));
  const safe = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const subject = `Struk Pembayaran CheatTech - ${orderId}`;
  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px">Struk Pembayaran</h2>
    <p style="margin:0 0 16px">Halo ${safe(customerName)}, terima kasih! Pembayaran kamu sudah kami terima.</p>

    <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#f8fafc">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#334155">Order ID</td><td style="padding:6px 0;text-align:right;font-weight:600">${safe(orderId)}</td></tr>
        <tr><td style="padding:6px 0;color:#334155">Nama</td><td style="padding:6px 0;text-align:right">${safe(customerName)}</td></tr>
        <tr><td style="padding:6px 0;color:#334155">Email</td><td style="padding:6px 0;text-align:right">${safe(customerEmail)}</td></tr>
        <tr><td style="padding:6px 0;color:#334155">Produk</td><td style="padding:6px 0;text-align:right">${safe(productName)}</td></tr>
        <tr><td style="padding:6px 0;color:#334155">Status</td><td style="padding:6px 0;text-align:right">${safe(paymentStatus)}</td></tr>
        <tr><td style="padding:10px 0;color:#0f172a;font-weight:700;border-top:1px solid #e2e8f0">Total</td><td style="padding:10px 0;text-align:right;font-weight:800;border-top:1px solid #e2e8f0">Rp${formattedPrice}</td></tr>
      </table>
    </div>

    <p style="margin:16px 0 0;color:#334155">
      Butuh bantuan/support? Hubungi kami:
      <br/>Email: <a href="mailto:${safe(supportEmail)}">${safe(supportEmail)}</a>
      <br/>WhatsApp: <a href="${safe(supportWhatsAppLink)}" target="_blank" rel="noopener">${safe(supportWhatsAppNumberDisplay)}</a>
    </p>

    <p style="margin:16px 0 0;color:#64748b;font-size:12px">
      Email ini adalah bukti pembayaran. Simpan untuk referensi.
    </p>
  </div>`;

  const text = [
    'Struk Pembayaran',
    `Order ID: ${orderId}`,
    `Nama: ${customerName}`,
    `Email: ${customerEmail}`,
    `Produk: ${productName}`,
    `Status: ${paymentStatus}`,
    `Total: Rp${formattedPrice}`,
    '',
    'Butuh bantuan/support?',
    `Email: ${supportEmail}`,
    `WhatsApp: ${supportWhatsAppNumberDisplay}`,
    supportWhatsAppLink,
  ].join('\n');

  await sendEmail({ to, subject, html, text });
}
