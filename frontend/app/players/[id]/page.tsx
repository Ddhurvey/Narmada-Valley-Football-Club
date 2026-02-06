"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  number: string;
  nationality: string;
  dob: string;
  heightCm: string;
  weightKg: string;
  photoURL?: string;
  bio?: string;
  joined?: string;
  contract?: string;
}

const calculateAge = (dob?: string) => {
  if (!dob) return "-";
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [player, setPlayer] = useState<PlayerRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayer() {
      const snap = await getDoc(doc(db, "players", playerId));
      if (snap.exists()) {
        setPlayer({ id: snap.id, ...(snap.data() as Omit<PlayerRow, "id">) });
      } else {
        setPlayer(null);
      }
      setLoading(false);
    }
    loadPlayer();
  }, [playerId]);

  const stats = useMemo(() => {
    return {
      appearances: 0,
      cleanSheets: 0,
      saves: 0,
      goalsConced: 0,
    };
  }, []);

  const performanceData = useMemo(() => {
    return [
      { month: "Aug", rating: 7.2 },
      { month: "Sep", rating: 7.8 },
      { month: "Oct", rating: 8.1 },
      { month: "Nov", rating: 7.5 },
      { month: "Dec", rating: 8.3 },
      { month: "Jan", rating: 7.9 },
    ];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-4">Player Not Found</h1>
          <Link href="/players">
            <Button variant="primary">Back to Squad</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom">
          <Link href="/players" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-white border-white hover:bg-white hover:text-nvfc-dark">
              ← Back to Squad
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            {/* Player Image */}
            <div className="relative">
              <div className="w-48 h-48 bg-nvfc-secondary rounded-full flex items-center justify-center text-8xl overflow-hidden">
                {player.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photoURL} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  "⚽"
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-nvfc-primary">{player.number}</span>
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-2">{player.name}</h1>
              <p className="text-2xl text-nvfc-secondary mb-4">{player.position}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div>
                  <span className="text-gray-300">Nationality:</span>
                  <span className="ml-2 font-semibold">{player.nationality}</span>
                </div>
                <div>
                  <span className="text-gray-300">Age:</span>
                  <span className="ml-2 font-semibold">{calculateAge(player.dob)}</span>
                </div>
                <div>
                  <span className="text-gray-300">Height:</span>
                  <span className="ml-2 font-semibold">
                    {player.heightCm ? `${player.heightCm} cm` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Weight:</span>
                  <span className="ml-2 font-semibold">
                    {player.weightKg ? `${player.weightKg} kg` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-nvfc-dark mb-4">Biography</h2>
                <p className="text-gray-700 leading-relaxed">{player.bio || "No biography available yet."}</p>
              </Card>
            </motion.div>

            {/* Season Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Season Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(stats).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold text-nvfc-primary mb-2">
                        {String(value)}
                        {key === "passAccuracy" && "%"}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Performance Rating</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#1a1f71"
                      strokeWidth={3}
                      dot={{ fill: "#ffd700", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-bold text-nvfc-dark mb-4">Contract Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Joined:</span>
                    <p className="font-semibold">
                      {player.joined ? new Date(player.joined).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contract Until:</span>
                    <p className="font-semibold">
                      {player.contract ? new Date(player.contract).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-bold text-nvfc-dark mb-4">Get Involved</h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Buy #{player.number} Jersey
                  </Button>
                  <Button variant="ghost" className="w-full">
                    View All Matches
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Social Share */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-bold text-nvfc-dark mb-4">Share Profile</h3>
                <div className="flex gap-2">
                  {["FB", "TW", "IG"].map((platform) => (
                    <button
                      key={platform}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm transition-colors"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
