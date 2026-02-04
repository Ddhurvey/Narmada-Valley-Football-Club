"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

const membershipPlans = [
  {
    id: "basic",
    name: "Basic Fan",
    price: 999,
    duration: "Annual",
    features: [
      "10% discount on merchandise",
      "Monthly newsletter",
      "Access to fan events",
      "Digital membership card",
    ],
  },
  {
    id: "premium",
    name: "Premium Supporter",
    price: 2999,
    duration: "Annual",
    popular: true,
    features: [
      "20% discount on merchandise",
      "Priority ticket booking",
      "Exclusive meet & greet events",
      "Free home match jersey",
      "VIP lounge access",
      "Behind-the-scenes content",
    ],
  },
  {
    id: "vip",
    name: "VIP Member",
    price: 9999,
    duration: "Annual",
    features: [
      "30% discount on merchandise",
      "Guaranteed tickets for all matches",
      "Player meet & greet sessions",
      "Free home & away jerseys",
      "VIP lounge & parking",
      "Exclusive training ground tours",
      "Name on club wall of fame",
    ],
  },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Become a Member</h1>
          <p className="text-xl">Join the NVFC family and enjoy exclusive benefits</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-8 h-full relative ${
                  plan.popular ? "ring-2 ring-nvfc-secondary shadow-xl" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-nvfc-secondary text-nvfc-dark px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-nvfc-dark mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-nvfc-primary mb-1">₹{plan.price}</div>
                  <div className="text-gray-600">{plan.duration}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  Choose Plan
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-nvfc-dark text-center mb-8">
            Why Become a Member?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: "🎟️", title: "Priority Access", desc: "Get first dibs on match tickets" },
              { icon: "💰", title: "Save Money", desc: "Exclusive discounts on merchandise" },
              { icon: "🤝", title: "Meet Players", desc: "Exclusive meet & greet events" },
              { icon: "🏆", title: "VIP Treatment", desc: "Access to VIP lounges and areas" },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
