import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { hashEmail, normalizeEmail } from "@/lib/otp";

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

    await docRef.set(
      {
        email,
        failCount: 0,
        otpVerifiedUntil: null,
        lastFailedAt: null,
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset login attempts" }, { status: 500 });
  }
}
