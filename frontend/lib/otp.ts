import crypto from "crypto";

export const OTP_ATTEMPT_THRESHOLD = 5;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_VERIFY_WINDOW_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashEmail(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
