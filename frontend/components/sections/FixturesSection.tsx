"use client";

import React, { useEffect, useState } from "react";
import type { ThemeConfig } from "@/types/layout";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FixtureRow {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  status: "upcoming" | "completed";
  homeScore?: number | null;
  awayScore?: number | null;
}

export default function FixturesSection({ config, theme }: { config: any; theme: ThemeConfig }) {
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      const fixturesQuery = query(collection(db, "fixtures"), orderBy("date", "desc"), limit(4));
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

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
            Upcoming Fixtures
          </h2>
          <Link href="/fixtures" className="text-sm text-nvfc-primary hover:underline">
            View all
          </Link>
        </div>

        {loading && <div className="text-gray-600">Loading fixtures...</div>}

        {!loading && fixtures.length === 0 && <div className="text-gray-600">No fixtures found.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fixtures.map((fixture) => (
            <Card key={fixture.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-500">{fixture.competition}</div>
                <div className="text-xs text-gray-500">{fixture.date} • {fixture.time}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fixture.homeLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fixture.homeLogoUrl} alt={fixture.homeTeam} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                  <span className="font-semibold text-gray-900">{fixture.homeTeam}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {fixture.status === "completed"
                    ? `${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0}`
                    : "vs"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{fixture.awayTeam}</span>
                  {fixture.awayLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fixture.awayLogoUrl} alt={fixture.awayTeam} className="w-8 h-8 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-500">{fixture.venue || "TBD"}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
