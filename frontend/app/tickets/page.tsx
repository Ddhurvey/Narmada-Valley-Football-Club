"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { motion } from "framer-motion";

const upcomingMatches = [
  { id: "1", opponent: "Rivals FC", date: "2026-02-15", time: "15:00", price: 500, available: 1500 },
  { id: "2", opponent: "City FC", date: "2026-02-22", time: "18:30", price: 600, available: 800 },
  { id: "3", opponent: "United FC", date: "2026-03-01", time: "20:00", price: 700, available: 2000 },
];

export default function TicketsPage() {
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const handleBooking = () => {
    if (!selectedMatch) return;
    alert(`Booking ${quantity} ticket(s) for ${selectedMatch.opponent}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Book Tickets</h1>
          <p className="text-xl">Secure your seat at Narmada Stadium</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-nvfc-dark">Upcoming Matches</h2>
            {upcomingMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  hover
                  className={`p-6 cursor-pointer ${
                    selectedMatch?.id === match.id ? "ring-2 ring-nvfc-primary" : ""
                  }`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-3xl">⚽</span>
                        <div>
                          <h3 className="text-xl font-bold text-nvfc-dark">
                            NVFC vs {match.opponent}
                          </h3>
                          <p className="text-gray-600">
                            {new Date(match.date).toLocaleDateString()} at {match.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>📍 Narmada Stadium</span>
                        <span>🎫 {match.available} tickets available</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-nvfc-primary">₹{match.price}</div>
                      <div className="text-sm text-gray-500">per ticket</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Booking Panel */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-bold text-nvfc-dark mb-4">Booking Summary</h3>
              {selectedMatch ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-600">Match</div>
                      <div className="font-semibold">NVFC vs {selectedMatch.opponent}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date & Time</div>
                      <div className="font-semibold">
                        {new Date(selectedMatch.date).toLocaleDateString()} at {selectedMatch.time}
                      </div>
                    </div>
                    <Input
                      label="Number of Tickets"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{selectedMatch.price * quantity}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Booking Fee</span>
                        <span className="font-semibold">₹50</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-nvfc-primary">
                          ₹{selectedMatch.price * quantity + 50}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" size="lg" className="w-full" onClick={handleBooking}>
                    Proceed to Payment
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🎫</div>
                  <p>Select a match to book tickets</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
