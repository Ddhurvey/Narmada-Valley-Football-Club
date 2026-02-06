import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Accessibility Statement</h1>
          <p className="text-gray-600">We aim to make our site accessible to everyone.</p>
        </motion.div>

        <Card className="p-6 space-y-4">
          <p className="text-gray-700">
            We are committed to providing a website that is accessible to the widest possible audience.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Need Assistance?</h2>
            <p className="text-gray-700">Email us at support@nvfc.com for help.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
