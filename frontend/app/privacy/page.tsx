import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 5, 2026</p>
        </motion.div>

        <Card className="p-6 space-y-4">
          <p className="text-gray-700">
            We respect your privacy. This policy explains what data we collect, why we collect it, and how
            we handle it.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Information We Collect</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Account details (name, email) when you sign up.</li>
              <li>Order and ticket information for purchases.</li>
              <li>Usage data for site performance and analytics.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Provide services like tickets, membership, and store orders.</li>
              <li>Improve our website and user experience.</li>
              <li>Send important updates and confirmations.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Contact</h2>
            <p className="text-gray-700">Questions? Email us at privacy@nvfc.com.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
