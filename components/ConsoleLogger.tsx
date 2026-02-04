"use client";

import { useEffect } from "react";

/**
 * This component filters out known noisy console errors related to 
 * ad-blockers blocking Firebase, or deprecated warnings.
 * It does not stop the errors from happening (since the network is actually blocked),
 * but it keeps the console cleaner for development.
 */
export default function ConsoleLogger() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const msg = args.join(" ").toLowerCase();
      
      // Filter out Firebase offline/blocking network errors
      if (
        msg.includes("err_blocked_by_client") || 
        msg.includes("failed to get document because the client is offline") ||
        msg.includes("cross-origin-opener-policy") ||
        msg.includes("firestore.googleapis.com")
      ) {
        // Suppress these specific errors
        return;
      }
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      const msg = args.join(" ").toLowerCase();
      // Filter deprecation warnings
      if (msg.includes("enableindexeddbpersistence() will be deprecated")) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      // Restore on unmount (optional, but good practice if checking components)
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
