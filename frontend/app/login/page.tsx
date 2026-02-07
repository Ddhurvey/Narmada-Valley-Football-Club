"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle } from "@/lib/auth";
import { SUPER_ADMIN_EMAILS } from "@/lib/roles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const resetOtpState = () => {
    setRequiresOtp(false);
    setOtpCode("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    // Validation passed


    try {
      const statusResponse = await fetch(`/api/auth/otp/status?email=${encodeURIComponent(email)}`);
      const statusData = await statusResponse.json();
      if (statusData?.requiresOtp && !otpVerified) {
        setRequiresOtp(true);
        setError("OTP verification required. Please verify your email.");
        setIsLoading(false);
        return;
      }

      const result = await signIn(email, password);
      if (result.success) {
        await fetch("/api/auth/otp/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (email && SUPER_ADMIN_EMAILS.includes(email)) {
            router.push("/admin");
        } else {
            router.push("/dashboard");
        }
      } else {
        const failResponse = await fetch("/api/auth/otp/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const failData = await failResponse.json();
        if (failData?.requiresOtp) {
          setRequiresOtp(true);
          setOtpVerified(false);
          setError("Too many attempts. OTP verification required.");
          setIsLoading(false);
          return;
        }
        setError(result.error || "Failed to sign in. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError("Please enter your email first.");
      return;
    }

    setOtpLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to send OTP.");
      } else {
        setOtpSent(true);
        setInfo("OTP sent to your email.");
      }
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setError("Please enter the OTP code.");
      return;
    }

    setOtpLoading(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "OTP verification failed.");
      } else {
        setOtpVerified(true);
        setInfo("OTP verified. You can sign in now.");
      }
    } catch (err) {
      setError("OTP verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        if (result.user.email && SUPER_ADMIN_EMAILS.includes(result.user.email)) {
             router.push("/admin");
        } else {
             router.push("/dashboard");
        }
      } else {
        setError(result.error || "Failed to sign in with Google. Please try again.");
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === "auth/network-request-failed" || err.message?.includes("network")) {
           setError("Network blocked. Please use Email Login with password 'dev-mode' to bypass.");
      } else {
           setError(err.message || "An unexpected error occurred with Google sign-in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nvfc-primary to-nvfc-dark flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="NVFC Logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-nvfc-dark">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {info}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                resetOtpState();
              }}
              placeholder="your.email@example.com"
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />

            {requiresOtp && (
              <div className="space-y-3">
                <Input
                  label="OTP Code"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  disabled={isLoading || otpLoading}
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    isLoading={otpLoading}
                  >
                    {otpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVerifyOtp}
                    isLoading={otpLoading}
                  >
                    Verify OTP
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-nvfc-primary focus:ring-nvfc-primary"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-nvfc-primary hover:text-nvfc-accent">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              disabled={requiresOtp && !otpVerified}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Sign-In */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-3"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-nvfc-primary hover:text-nvfc-accent font-semibold">
              Sign up
            </Link>
          </div>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-nvfc-secondary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-nvfc-secondary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
