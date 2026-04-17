type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.EMAIL_FROM || 'CheatTech <noreply@cheattech.local>';

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set. Email not sent.');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Failed to send email via Resend', response.status, text);
    throw new Error('Failed to send email');
  }
}

export async function sendSelfSetupEmail(params: {
  to: string;
  productName: string;
  orderId?: string;
  downloadUrl: string;
}) {
  const { to, productName, orderId, downloadUrl } = params;
  const subject = `Link download ${productName}`;
  const html = `
    <p>Halo,</p>
    <p>Terima kasih sudah membeli <strong>${productName}</strong>.</p>
    <p>Silakan unduh file dan panduan setup mandiri melalui tautan berikut:</p>
    <p><a href="${downloadUrl}" target="_blank" rel="noopener">Download ${productName}</a></p>
    ${orderId ? `<p>ID Pesanan: <strong>${orderId}</strong></p>` : ''}
    <p>Jika butuh bantuan lebih lanjut, balas email ini atau hubungi kami.</p>
    <p>Salam,<br/>Tim CheatTech</p>
  `;

  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error('sendSelfSetupEmail error', error);
  }
}

