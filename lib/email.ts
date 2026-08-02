import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(
      `[EMAIL_SKIPPED] SMTP not configured. Would have sent "${params.subject}" to ${params.to}`
    );
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? '"L\'Atelier Haute Boutique" <no-reply@latelier.com>',
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export function passwordResetEmailTemplate(resetUrl: string, name: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #0B0F0D;">
      <p style="letter-spacing: 3px; text-transform: uppercase; font-size: 12px; color: #0B6E4F; margin-bottom: 24px;">
        L'Atelier Haute Boutique
      </p>
      <h1 style="font-size: 24px; font-weight: 500; margin-bottom: 16px;">Reset your password</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #333;">
        Hello ${name}, we received a request to reset your password. This link expires in one hour.
      </p>
      <a href="${resetUrl}" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #0B6E4F; color: #F7F5F0; text-decoration: none; border-radius: 999px; font-size: 14px;">
        Reset Password
      </a>
      <p style="font-size: 13px; color: #888; margin-top: 32px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

export function orderConfirmationEmailTemplate(params: {
  name: string;
  orderNumber: string;
  total: number;
}) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #0B0F0D;">
      <p style="letter-spacing: 3px; text-transform: uppercase; font-size: 12px; color: #0B6E4F; margin-bottom: 24px;">
        L'Atelier Haute Boutique
      </p>
      <h1 style="font-size: 24px; font-weight: 500; margin-bottom: 16px;">Thank you, ${params.name}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #333;">
        Your order <strong>${params.orderNumber}</strong> has been confirmed. We will notify you as it moves toward your door.
      </p>
      <p style="font-size: 18px; margin-top: 24px;">Total: ₹${params.total.toLocaleString("en-IN")}</p>
    </div>
  `;
}
