"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ROLES, SUPER_ADMIN_EMAILS } from "@/lib/roles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow public access to the login page
    if (pathname === "/admin/login") {
      setLoading(false);
      setAuthorized(true);
      return;
    }

    // DEV MODE BYPASS CHECK
    if (typeof window !== "undefined" && localStorage.getItem("nvfc_dev_bypass") === "true") {
        setLoading(false);
        setAuthorized(true);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // FAST PATH: Check email whitelist immediately
        // This handles Google Login users and pre-approved admins instantly
        if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
            console.log("Super Admin identified via whitelist:", user.email);
            setAuthorized(true); // Grant access immediately
            setLoading(false);
            return;
        }

        try {
          // Check role
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            const role = userData.role;

            if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
              setAuthorized(true);
            } else {
              // Not an admin - redirect to user dashboard
              router.push("/dashboard");
            }
          } else {
            // No profile but logged in? Double check whitelist.
             router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error verifying admin:", error);
          // Firestore is blocked/offline - check email whitelist as fallback
          if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
            setAuthorized(true);
          } else {
            // Not in whitelist - redirect to login
            router.push("/admin/login");
          }
        }
      } else {
        // Not logged in - redirect to admin login
        router.push("/admin/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Issue</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t verify your admin permissions. This usually happens if
            your connection is blocked (e.g., by an ad blocker).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-nvfc-primary text-white rounded hover:bg-nvfc-dark transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar could go here */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
