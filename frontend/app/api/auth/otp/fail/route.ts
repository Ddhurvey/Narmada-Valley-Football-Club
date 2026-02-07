import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { hashEmail, normalizeEmail, OTP_ATTEMPT_THRESHOLD } from "@/lib/otp";

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
    const current = snapshot.exists ? snapshot.data() || {} : {};
    const failCount = (current.failCount || 0) + 1;

    await docRef.set(
      {
        email,
        failCount,
        lastFailedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ requiresOtp: failCount >= OTP_ATTEMPT_THRESHOLD });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update login attempts" }, { status: 500 });
  }
}
