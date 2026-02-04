"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginRedirect() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nvfc-primary to-nvfc-dark flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <div className="mb-8">
          <img src="/logo.png" alt="NVFC Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
          <p className="text-gray-300">Redirecting to login page...</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="text-6xl font-bold mb-2">{countdown}</div>
          <p className="text-sm text-gray-300">seconds</p>
        </div>

        <div className="text-sm text-gray-400">
          <p>After logging in, admins can access the dashboard.</p>
          <p className="mt-2">First user becomes Super Admin automatically!</p>
        </div>
      </div>
    </div>
  );
}
