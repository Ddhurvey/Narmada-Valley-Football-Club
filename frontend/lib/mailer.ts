import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebaseAdmin";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const secure = process.env.SMTP_SECURE === "true";
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || user;

const smtpConfigured = !!(host && port && user && pass);

export const mailer = smtpConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })
  : null;

export async function sendOtpEmail(to: string, code: string) {
  const subject = "Your NVFC login verification code";
  const text = `Your one-time verification code is ${code}. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>NVFC Login Verification</h2>
      <p>Your one-time verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  if (mailer) {
    await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return;
  }

  await adminDb.collection("mail").add({
    to,
    message: {
      subject,
      text,
      html,
    },
  });
}
