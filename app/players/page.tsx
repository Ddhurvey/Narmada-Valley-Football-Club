"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

// Mock players data
const mockPlayers = [
  {
    id: "1",
    name: "John Smith",
    position: "Goalkeeper",
    number: 1,
    nationality: "India",
    age: 28,
    height: "6'2\"",
    image: "/players/1.jpg",
  },
  {
    id: "2",
    name: "Raj Kumar",
    position: "Defender",
    number: 4,
    nationality: "India",
    age: 26,
    height: "6'0\"",
    image: "/players/2.jpg",
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    position: "Midfielder",
    number: 8,
    nationality: "Spain",
    age: 24,
    height: "5'10\"",
    image: "/players/3.jpg",
  },
  {
    id: "4",
    name: "Michael Johnson",
    position: "Forward",
    number: 9,
    nationality: "Brazil",
    age: 25,
    height: "5'11\"",
    image: "/players/4.jpg",
  },
  {
    id: "5",
    name: "David Singh",
    position: "Defender",
    number: 5,
    nationality: "India",
    age: 27,
    height: "6'1\"",
    image: "/players/5.jpg",
  },
  {
    id: "6",
    name: "Carlos Martinez",
    position: "Midfielder",
    number: 10,
    nationality: "Argentina",
    age: 29,
    height: "5'9\"",
    image: "/players/6.jpg",
  },
];

export default function PlayersPage() {
  const [selectedPosition, setSelectedPosition] = useState("All");

  const positions = ["All", "Goalkeeper", "Defender", "Midfielder", "Forward"];

  const filteredPlayers =
    selectedPosition === "All"
      ? mockPlayers
      : mockPlayers.filter((player) => player.position === selectedPosition);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">First Team Squad</h1>
            <p className="text-xl text-gray-200">
              Meet the players representing Narmada Valley Football Club
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Position Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {positions.map((position) => (
              <button
                key={position}
                onClick={() => setSelectedPosition(position)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedPosition === position
                    ? "bg-nvfc-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={`/players/${player.id}`}>
                <Card hover className="overflow-hidden">
                  {/* Player Image */}
                  <div className="aspect-square bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white relative">
                    <div className="text-6xl">⚽</div>
                    <div className="absolute top-4 right-4 w-12 h-12 bg-nvfc-secondary rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-nvfc-primary">
                        {player.number}
                      </span>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-nvfc-dark mb-2">
                      {player.name}
                    </h3>
                    <p className="text-nvfc-primary font-semibold mb-3">
                      {player.position}
                    </p>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Nationality:</span>
                        <span className="font-medium">{player.nationality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Age:</span>
                        <span className="font-medium">{player.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Height:</span>
                        <span className="font-medium">{player.height}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="w-full">
                        View Profile →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Squad Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Squad Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Players", value: "25" },
              { label: "Average Age", value: "26.5" },
              { label: "International Players", value: "8" },
              { label: "Academy Graduates", value: "6" },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-3xl font-bold text-nvfc-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
