import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  generateOtpCode,
  hashEmail,
  hashOtp,
  normalizeEmail,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailParam = body?.email;

    if (!emailParam) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(emailParam);
    const emailHash = hashEmail(email);
    const docRef = adminDb.collection("loginAttempts").doc(emailHash);
    const snapshot = await docRef.get();

    const now = new Date();
    if (snapshot.exists) {
      const data = snapshot.data() || {};
      const lastSent = data.otpSentAt?.toDate?.() || null;
      if (lastSent && now.getTime() - lastSent.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
        return NextResponse.json({ error: "Please wait before requesting a new code." }, { status: 429 });
      }
    }

    const code = generateOtpCode();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await docRef.set(
      {
        email,
        otpCodeHash: codeHash,
        otpSentAt: now,
        otpExpiresAt: expiresAt,
      },
      { merge: true }
    );

    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
