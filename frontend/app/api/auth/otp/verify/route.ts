import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { hashEmail, hashOtp, normalizeEmail, OTP_VERIFY_WINDOW_MINUTES } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailParam = body?.email;
    const code = body?.code;

    if (!emailParam || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const email = normalizeEmail(emailParam);
    const emailHash = hashEmail(email);
    const docRef = adminDb.collection("loginAttempts").doc(emailHash);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "No OTP request found" }, { status: 400 });
    }

    const data = snapshot.data() || {};
    const otpExpiresAt = data.otpExpiresAt?.toDate?.() || null;

    if (!data.otpCodeHash || !otpExpiresAt || otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new code." }, { status: 400 });
    }

    const codeHash = hashOtp(String(code));
    if (codeHash !== data.otpCodeHash) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    const verifiedUntil = new Date(Date.now() + OTP_VERIFY_WINDOW_MINUTES * 60 * 1000);

    await docRef.set(
      {
        otpVerifiedUntil: verifiedUntil,
        otpCodeHash: null,
        otpExpiresAt: null,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
