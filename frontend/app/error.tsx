"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isFirebaseOffline = error.message?.includes("offline") || error.message?.includes("Firebase");

  return (
    <div className="min-h-screen bg-gradient-to-br from-nvfc-primary to-nvfc-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-nvfc-dark mb-2">
            {isFirebaseOffline ? "Connection Issue" : "Something went wrong!"}
          </h2>
        </div>

        {isFirebaseOffline ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Unable to connect to the database. This is usually caused by:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li>Ad blocker or privacy extension blocking Firebase</li>
              <li>Network connectivity issues</li>
              <li>Firewall settings</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800 font-semibold mb-2">
                💡 Quick Fix:
              </p>
              <p className="text-sm text-yellow-700">
                Disable your ad blocker for localhost:3000 or whitelist firebaseapp.com and googleapis.com
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
        )}

        <div className="flex gap-4 mt-6">
          <Button
            onClick={reset}
            variant="primary"
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = "/"}
            variant="ghost"
            className="flex-1"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
