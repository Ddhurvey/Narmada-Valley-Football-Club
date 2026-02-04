"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

// Mock live match data - in production, this would come from Socket.IO
interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: "live" | "halftime" | "finished";
  events: MatchEvent[];
}

interface MatchEvent {
  id: string;
  minute: number;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  player: string;
  team: "home" | "away";
}

export default function LiveMatchPage() {
  const [match, setMatch] = useState<LiveMatch>({
    id: "1",
    homeTeam: "NVFC",
    awayTeam: "Rivals FC",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    status: "live",
    events: [
      { id: "1", minute: 15, type: "goal", player: "Michael Johnson", team: "home" },
      { id: "2", minute: 34, type: "goal", player: "Opponent Player", team: "away" },
      { id: "3", minute: 56, type: "goal", player: "Carlos Martinez", team: "home" },
    ],
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMatch((prev) => ({
        ...prev,
        minute: prev.minute < 90 ? prev.minute + 1 : prev.minute,
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-5xl">
        {/* Live Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 font-bold uppercase">Live</span>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 mb-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Home Team */}
              <div className="text-center">
                <div className="text-6xl mb-4">⚽</div>
                <h2 className="text-2xl font-bold text-nvfc-primary">{match.homeTeam}</h2>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-6xl font-bold text-nvfc-dark mb-2">
                  {match.homeScore} - {match.awayScore}
                </div>
                <div className="text-xl text-gray-600">{match.minute}'</div>
                <div className="mt-2">
                  <span className="inline-block px-4 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                    {match.status === "live" ? "LIVE" : match.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="text-6xl mb-4">⚽</div>
                <h2 className="text-2xl font-bold text-gray-700">{match.awayTeam}</h2>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Match Events */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-nvfc-dark mb-4">Match Events</h3>
          <div className="space-y-4">
            {match.events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-nvfc-primary rounded-full flex items-center justify-center text-white font-bold">
                  {event.minute}'
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{event.player}</div>
                  <div className="text-sm text-gray-600">
                    {event.type === "goal" && "⚽ Goal"}
                    {event.type === "yellow_card" && "🟨 Yellow Card"}
                    {event.type === "red_card" && "🟥 Red Card"}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {event.team === "home" ? match.homeTeam : match.awayTeam}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h4 className="font-bold mb-4">Possession</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-nvfc-primary h-4 rounded-full" style={{ width: "58%" }}></div>
              </div>
              <span className="font-bold">58%</span>
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-4">Shots on Target</h4>
            <div className="text-3xl font-bold text-nvfc-primary">7 - 4</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
