"use client";

import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

export default function ProductsPage() {
  return (
    <div className="container-custom py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-nvfc-dark mb-6">Product Management</h1>
        <Card className="p-12 text-center text-gray-500">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-xl font-semibold">Under Construction</p>
          <p className="mt-2">Store and merchandise management is coming soon.</p>
        </Card>
      </motion.div>
    </div>
  );
}
