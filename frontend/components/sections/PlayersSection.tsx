"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { ThemeConfig } from "@/types/layout";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  number: string;
  team: string;
  photoURL?: string;
  status?: "active" | "injured" | "loan" | "left";
}

export default function PlayersSection({ config, theme }: { config: any; theme: ThemeConfig }) {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const playersQuery = query(collection(db, "players"), orderBy("createdAt", "desc"), limit(12));
      const snapshot = await getDocs(playersQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PlayerRow, "id" | "team">),
        team: ((): PlayerRow["team"] => {
          const value = (d.data() as { team?: string }).team;
          const allowed = [
            "boys",
            "girls",
            "boys-u15",
            "boys-u18",
            "boys-u19",
            "girls-u15",
            "girls-u18",
            "girls-u19",
          ];
          if (allowed.includes(value ?? "")) {
            return value as PlayerRow["team"];
          }
          return "boys";
        })(),
      }));
      setPlayers(rows);
      setLoading(false);
    }
    loadPlayers();
  }, []);

  const visiblePlayers = useMemo(() => {
    const list = players.filter((p) => p.status !== "left");
    return list.slice(0, 6);
  }, [players]);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
            Our Squad
          </h2>
          <Link href="/players" className="text-sm text-nvfc-primary hover:underline">
            View all
          </Link>
        </div>

        {loading && <div className="text-gray-600">Loading players...</div>}

        {!loading && visiblePlayers.length === 0 && <div className="text-gray-600">No players found.</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePlayers.map((player) => (
            <Card key={player.id} className="p-6">
              <div className="flex items-center gap-4">
                {player.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.photoURL} alt={player.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-nvfc-primary text-white flex items-center justify-center">
                    {player.name?.[0] || "P"}
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-600">{player.position}</div>
                </div>
                <div className="ml-auto text-sm text-gray-600">#{player.number}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
