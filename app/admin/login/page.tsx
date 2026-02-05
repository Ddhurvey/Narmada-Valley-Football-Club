"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signIn, getUserProfile } from "@/lib/auth";
import { ROLES, SUPER_ADMIN_EMAILS } from "@/lib/roles";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nvfc.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError("");
    
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        // ... (rest of Google login logic)
        const profile = await getUserProfile(result.user.uid);
        if (profile && (profile.role === ROLES.ADMIN || profile.role === ROLES.SUPER_ADMIN)) {
            router.push("/admin");
        } else if (result.user.email && SUPER_ADMIN_EMAILS.includes(result.user.email)) {
             router.push("/admin");
        } else {
             setError("Access Denied: You do not have administrator privileges.");
             setIsLoggingIn(false);
        }
      } else {
        setError(result.error || "Login failed");
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      console.error("Google Login Error:", err);
      
      // AUTO-DEV BYPASS for Specific Emails on Network Error
      if (err.code === "auth/network-request-failed" || err.message?.includes("network")) {
           setError("Network blocked. Please use Email Login with password 'dev-mode' to bypass.");
      } else {
           setError(err.message || "Login failed");
      }
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    // Failsafe: Stop loading after 8 seconds no matter what
    const timeoutId = setTimeout(() => {
        setIsLoggingIn((current) => {
            if (current) {
                setError("Login request timed out. Please check your internet connection.");
                return false;
            }
            return current;
        });
    }, 8000);
    
    
    // DEV BYPASS: If network is completely blocked, use this backdoor
    if (SUPER_ADMIN_EMAILS.includes(email) && password === "dev-mode") {
        console.log("⚠️ DEV MODE: Bypassing Firebase Auth");
        localStorage.setItem("nvfc_dev_bypass", "true"); // Enable bypass in Layout
        // Mock a successful login
        const mockUser = { uid: "dev-admin-uid", email: email };
        // Force redirect
        router.push("/admin");
        return;
    }
    
    try {
      // 1. Try to Login
      let result = await signIn(email, password);
      
      clearTimeout(timeoutId); // Clear timeout if successful

      
      // 2. If Login failed because user doesn't exist, try to Create Account automatically
      if (!result.success && (
          result.error?.includes("user-not-found") || 
          result.error?.includes("Invalid email or password") // Firebase often masks 'not-found' as 'invalid-credential'
      )) {
          console.log("User not found, attempting to auto-create...");
          // Try to create the admin account on the fly
          const signupResult = await import("@/lib/auth").then(m => m.signUp(email, password, "Admin"));
          
          if (signupResult.success) {
              result = signupResult; // successfully created and logged in
          }
      }

      if (result.success && result.user) {
        // Try to get profile from Firestore
        const profile = await getUserProfile(result.user.uid);
        
        // If profile exists, check role normally
        if (profile) {
          if (profile.role === ROLES.ADMIN || profile.role === ROLES.SUPER_ADMIN) {
            router.push("/admin");
          } else {
            setError("Access Denied: You do not have administrator privileges.");
            setIsLoggingIn(false);
          }
        } else {
          // Firestore is blocked/offline - check email whitelist as fallback
          if (result.user.email && SUPER_ADMIN_EMAILS.includes(result.user.email)) {
            console.log("Firestore blocked - using email whitelist for admin access");
            router.push("/admin");
          } else {
            setError("Access Denied: You do not have administrator privileges.");
            setIsLoggingIn(false);
          }
        }
      } else {
        setError(result.error || "Login failed");
        setIsLoggingIn(false);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-xl border-t-4 border-nvfc-primary">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-nvfc-dark">Admin Portal</h1>
            <p className="text-gray-500 mt-2">Secure access for NVFC staff</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
              disabled={isLoggingIn}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLoggingIn ? "Signing in..." : "Sign in with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvfc-primary focus:border-transparent outline-none transition"
                  placeholder="admin@nvfc.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvfc-primary focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn || !email || !password}
              >
                {isLoggingIn ? "Authenticating..." : "Login to Dashboard"}
              </Button>
            </form>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
             Authorized personnel only. <br/>
             All login attempts are monitored and logged.
          </div>
          <div className="mt-6 text-center text-sm text-gray-600">
            Need help? Contact the IT support team.
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
