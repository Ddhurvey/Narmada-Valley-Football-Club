"use client";

import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: February 5, 2026</p>
        </motion.div>

        <Card className="p-6 space-y-4">
          <p className="text-gray-700">
            By using this website, you agree to the terms below. Please read them carefully.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Use of Site</h2>
            <p className="text-gray-700">You may use this site for personal, non-commercial purposes.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Purchases</h2>
            <p className="text-gray-700">Tickets and store purchases are subject to availability and club policies.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-nvfc-dark mb-2">Changes</h2>
            <p className="text-gray-700">We may update these terms from time to time.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}
