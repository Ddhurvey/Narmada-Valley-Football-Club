import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { hashEmail, normalizeEmail, OTP_ATTEMPT_THRESHOLD } from "@/lib/otp";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get("email");

    if (!emailParam) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = normalizeEmail(emailParam);
    const emailHash = hashEmail(email);
    const docRef = adminDb.collection("loginAttempts").doc(emailHash);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ requiresOtp: false });
    }

    const data = snapshot.data() || {};
    const failCount = data.failCount || 0;
    const otpVerifiedUntil = data.otpVerifiedUntil?.toDate?.() || null;

    const now = new Date();
    const requiresOtp = failCount >= OTP_ATTEMPT_THRESHOLD && (!otpVerifiedUntil || otpVerifiedUntil < now);

    return NextResponse.json({ requiresOtp });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check OTP status" }, { status: 500 });
  }
}
