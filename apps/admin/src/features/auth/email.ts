import nodemailer from "nodemailer";

import { ADMIN_EMAIL } from "./constants";

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetEmail(resetUrl: string) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error(
      "Email is not configured. Set SMTP_USER and SMTP_PASS in the server environment."
    );
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: ADMIN_EMAIL,
    subject: "ORYX Admin — Reset your password",
    text: `Use this link to reset your admin password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Georgia, serif; color: #3d2c29; max-width: 520px;">
        <h2 style="margin-bottom: 8px;">ORYX Admin</h2>
        <p style="color: #6b5b54; line-height: 1.6;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #a87434; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">
            Reset password
          </a>
        </p>
        <p style="color: #9a8276; font-size: 13px;">
          If you did not request a reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
