"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  number: string;
  team: string;
  nationality: string;
  dob: string;
  heightCm: string;
  photoURL?: string;
  status?: "active" | "injured" | "loan" | "left";
}

interface TeamItem {
  id: string;
  slug: string;
  label: string;
  order?: number;
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

function PlayersPageContent() {
  const searchParams = useSearchParams();
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  const positions = ["All", "Goalkeeper", "Defender", "Midfielder", "Forward"];
  const teamOptions = [
    { label: "All", value: "All" },
    ...(teams.length
      ? teams.map((team) => ({ label: team.label, value: team.slug }))
      : [
          { label: "Boys Team", value: "boys" },
          { label: "Boys U15", value: "boys-u15" },
          { label: "Boys U18", value: "boys-u18" },
          { label: "Boys U19", value: "boys-u19" },
          { label: "Girls Team", value: "girls" },
          { label: "Girls U15", value: "girls-u15" },
          { label: "Girls U18", value: "girls-u18" },
          { label: "Girls U19", value: "girls-u19" },
        ]),
  ];

  useEffect(() => {
    async function loadPlayers() {
      const playersQuery = query(collection(db, "players"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(playersQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PlayerRow, "id" | "team">),
        team: (d.data() as { team?: string }).team || "boys",
      }));
      setPlayers(rows);
      setLoading(false);
    }
    loadPlayers();
  }, []);

  useEffect(() => {
    async function loadTeams() {
      const teamsQuery = query(collection(db, "teams"), orderBy("order", "asc"));
      const snapshot = await getDocs(teamsQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamItem, "id">),
      }));
      setTeams(rows);
    }
    loadTeams();
  }, []);

  useEffect(() => {
    const teamParam = searchParams.get("team");
    const allowed = new Set(["All", ...teamOptions.map((team) => team.value)]);
    if (teamParam && allowed.has(teamParam)) {
      setSelectedTeam(teamParam);
    }
  }, [searchParams, teamOptions]);

  const filteredPlayers = useMemo(() => {
    let list = [...players];
    if (selectedTeam !== "All") {
      list = list.filter((player) => player.team === selectedTeam);
    }
    if (selectedPosition !== "All") {
      list = list.filter((player) => player.position === selectedPosition);
    }
    return list.sort((a, b) => {
      const statusRank = (status?: PlayerRow["status"]) => {
        switch (status) {
          case "active":
            return 0;
          case "injured":
            return 1;
          case "loan":
            return 2;
          case "left":
            return 3;
          default:
            return 1;
        }
      };
      return statusRank(a.status) - statusRank(b.status);
    });
  }, [players, selectedPosition, selectedTeam]);

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
        {/* Team Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {teamOptions.map((team) => (
              <button
                key={team.value}
                onClick={() => setSelectedTeam(team.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedTeam === team.value
                    ? "bg-nvfc-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {team.label}
              </button>
            ))}
          </div>
        </motion.div>

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
          {loading && (
            <div className="col-span-full text-center text-gray-500">Loading players...</div>
          )}
          {!loading && filteredPlayers.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No players found.</div>
          )}
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
                    {player.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.photoURL} alt={player.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl">⚽</div>
                    )}
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
                        <span className="font-medium">{calculateAge(player.dob)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Height:</span>
                        <span className="font-medium">
                          {player.heightCm ? `${player.heightCm} cm` : "-"}
                        </span>
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

export default function PlayersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}> 
      <PlayersPageContent />
    </Suspense>
  );
}
