"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Team logos mapping
const teamLogos: Record<string, string> = {
  "NVFC": "/logo.png",
  "Rivals FC": "⚔️",
  "City FC": "🌟",
  "United FC": "🔴",
  "Champions FC": "🏆",
};

interface FixtureRow {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  venue: string;
  competition: string;
  status: "upcoming" | "completed";
}

export default function FixturesPage() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      const fixturesQuery = query(collection(db, "fixtures"), orderBy("date", "desc"));
      const snapshot = await getDocs(fixturesQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FixtureRow, "id">),
      }));
      setFixtures(rows);
      setLoading(false);
    }
    loadFixtures();
  }, []);

  const filteredFixtures = useMemo(() => {
    if (filter === "all") return fixtures;
    return fixtures.filter((fixture) => fixture.status === filter);
  }, [fixtures, filter]);

  const getResultBadge = (fixture: any) => {
    if (fixture.status === "upcoming") return null;

    const isHome = fixture.homeTeam === "NVFC";
    const nvfcScore = isHome ? fixture.homeScore : fixture.awayScore;
    const opponentScore = isHome ? fixture.awayScore : fixture.homeScore;

    if (nvfcScore > opponentScore) {
      return <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">W</span>;
    } else if (nvfcScore < opponentScore) {
      return <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">L</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">D</span>;
    }
  };

  const TeamLogo = ({ team, logoUrl }: { team: string; logoUrl?: string }) => {
    const logo = logoUrl || teamLogos[team] || "⚽";

    if (logo.startsWith("/")) {
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img src={logo} alt={`${team} logo`} className="w-10 h-10 object-contain" />;
    }
    if (logo.startsWith("http")) {
      /* eslint-disable-next-line @next/next/no-img-element */
      return <img src={logo} alt={`${team} logo`} className="w-10 h-10 object-contain" />;
    }
    return <span className="text-3xl">{logo}</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Fixtures & Results</h1>
            <p className="text-xl text-gray-200">
              View all NVFC matches, past and upcoming
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-4 border-b border-gray-200">
            {[
              { label: "All Matches", value: "all" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Results", value: "completed" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`px-6 py-3 font-semibold transition-all ${
                  filter === tab.value
                    ? "border-b-2 border-nvfc-primary text-nvfc-primary"
                    : "text-gray-600 hover:text-nvfc-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Fixtures List */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center text-gray-500">Loading fixtures...</div>
          )}
          {!loading && filteredFixtures.length === 0 && (
            <div className="text-center text-gray-500">No fixtures found.</div>
          )}
          {filteredFixtures.map((fixture, index) => (
            <motion.div
              key={fixture.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  {/* Date & Competition */}
                  <div className="flex flex-col gap-2 md:w-48">
                    <span className="text-sm font-semibold text-nvfc-primary">
                      {fixture.competition}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(fixture.date)}
                    </span>
                    <span className="text-sm text-gray-600">{fixture.time}</span>
                  </div>

                  {/* Teams & Score */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 flex-1">
                        <TeamLogo team={fixture.homeTeam} logoUrl={fixture.homeLogoUrl} />
                        <span
                          className={`text-lg font-bold ${
                            fixture.homeTeam === "NVFC" ? "text-nvfc-primary" : "text-gray-800"
                          }`}
                        >
                          {fixture.homeTeam}
                        </span>
                      </div>

                      {/* Score or VS */}
                      {fixture.status === "completed" ? (
                        <span className="text-2xl font-bold text-nvfc-dark mx-4">
                          {fixture.homeScore} - {fixture.awayScore}
                        </span>
                      ) : (
                        <span className="text-lg font-semibold text-gray-400 mx-4">vs</span>
                      )}

                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span
                          className={`text-lg font-bold ${
                            fixture.awayTeam === "NVFC" ? "text-nvfc-primary" : "text-gray-800"
                          }`}
                        >
                          {fixture.awayTeam}
                        </span>
                        <TeamLogo team={fixture.awayTeam} logoUrl={fixture.awayLogoUrl} />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      📍 {fixture.venue}
                    </div>
                  </div>

                  {/* Result Badge & Actions */}
                  <div className="flex items-center gap-4 md:w-48 justify-end">
                    {getResultBadge(fixture)}
                    {fixture.status === "upcoming" ? (
                      <Button variant="primary" size="sm">
                        Buy Tickets
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        Match Report
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="ghost" size="lg">
            Load More Fixtures
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
