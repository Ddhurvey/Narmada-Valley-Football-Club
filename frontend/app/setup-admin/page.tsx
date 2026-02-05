"use client";

import { useState } from "react";
import { signUp, signIn } from "@/lib/auth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function SetupAdminPage() {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const router = useRouter();

  const createAdmin = async () => {
    setStatus("loading");
    setMessage("Creating admin account...");

    try {
      // 1. Try to Sign Up
      const result = await signUp("admin@nvfc.com", "Admin@123", "Super Admin");

      if (result.success) {
        setStatus("success");
        setMessage("✅ Success! Account created. \nEmail: admin@nvfc.com \nPassword: Admin@123");
      } else {
        // 2. If already exists, validation/error
        if (result.error && typeof result.error === 'string' && result.error.includes("already registered")) {
           setMessage("⚠️ Account already exists. Trying to log in with 'Admin@123' to verify...");
           
           // Try logging in to see if password is correct
           const loginResult = await signIn("admin@nvfc.com", "Admin@123");
           if (loginResult.success) {
               setStatus("success");
               setMessage("✅ Account exists and password 'Admin@123' is correct! You can go log in.");
           } else {
               setStatus("error");
               setMessage("❌ Account exists but password is NOT 'Admin@123'. \nError: " + loginResult.error + "\n\nPlease delete the user in Firebase Console or use 'Forgot Password'.");
           }
        } else {
            // Check specifically for "auth/operation-not-allowed"
            if (result.error && result.error.includes("operation-not-allowed")) {
                setStatus("error");
                setMessage("❌ Error: Email/Password provider is NOT enabled in Firebase Console.\n\nGo to Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password.");
            } else {
                setStatus("error");
                setMessage("❌ Error: " + result.error);
            }
        }
      }
    } catch (e: any) {
      if (e.code === 'auth/operation-not-allowed') {
          setStatus("error");
          setMessage("❌ Error: Email/Password provider is NOT enabled in Firebase Console.\n\nGo to Firebase Console -> Authentication -> Sign-in method -> Enable Email/Password.");
      } else {
          setStatus("error");
          setMessage("❌ Unexpected Error: " + e.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Setup Tool</h1>
        
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded text-sm text-left">
           This tool will attempt to create the default admin account:
           <ul className="list-disc ml-5 mt-2 font-mono">
             <li>Email: admin@nvfc.com</li>
             <li>Pass: Admin@123</li>
           </ul>
        </div>

        {message && (
            <div className={`mb-6 p-4 rounded text-left whitespace-pre-wrap ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
            </div>
        )}

        <div className="space-y-4">
            <Button onClick={createAdmin} disabled={status === 'loading'} className="w-full">
            {status === 'loading' ? 'Processing...' : 'Create Admin Account'}
            </Button>

            <Button variant="outline" onClick={() => router.push("/admin/login")} className="w-full">
            Go to Admin Login
            </Button>
        </div>
      </Card>
    </div>
  );
}
