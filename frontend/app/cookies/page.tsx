import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: February 5, 2026</p>
        </motion.div>

        <Card className="p-6 space-y-4">
          <p className="text-gray-700">
            We use cookies to improve your experience, remember preferences, and analyze site usage.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">What We Use</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Essential cookies for authentication and security.</li>
              <li>Performance cookies to understand traffic.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Manage Cookies</h2>
            <p className="text-gray-700">You can manage cookies in your browser settings.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
