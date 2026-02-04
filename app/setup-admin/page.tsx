"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import { ROLES } from "@/lib/roles";

export default function SetupAdmin() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const makeMeAdmin = async () => {
    if (!user) return;
    setLoading(true);
    setStatus("Processing...");
    try {
      await updateDoc(doc(db, "users", user.uid), { role: ROLES.SUPER_ADMIN });
      await setDoc(doc(db, "roles", "config"), { lockedSuperAdminUID: user.uid, updatedAt: new Date() });
      setStatus("SUCCESS! You are now Super Admin. Redirecting...");
      setTimeout(() => window.location.href = "/admin", 2000);
    } catch (error: any) {
      console.error(error);
      setStatus("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await import("@/lib/auth").then(m => m.signInWithGoogle());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold">Emergency Admin Fix</h1>
      
      {!user ? (
        <div className="text-center">
          <p className="mb-4">You are not logged in.</p>
          <Button onClick={handleLogin} size="lg">Login with Google</Button>
        </div>
      ) : (
        <>
          <p className="max-w-md text-center">
            Logged in as: <strong>{user.email}</strong><br/>
            Click below to upgrade this account to Super Admin.
          </p>
          <Button onClick={makeMeAdmin} disabled={loading} size="lg">
            {loading ? "Upgrading..." : "Make Me Super Admin"}
          </Button>
        </>
      )}

      {status && (
        <div className={`p-4 rounded ${status.includes("SUCCESS") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {status}
        </div>
      )}
    </div>
  );
}
