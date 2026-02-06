"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface RecordRow {
  id: string;
  title: string;
  teamName: string;
  gender: "boys" | "girls";
  teamGroup: string;
  teamLogoUrl?: string;
  opponent: string;
  opponentLogoUrl?: string;
  date: string;
  venue: string;
  competition: string;
  season: string;
  result: "win" | "draw" | "loss";
  scoreline: string;
  highlightsUrl?: string;
  notes?: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [selectedCompetition, setSelectedCompetition] = useState("All");
  const [selectedTeamGroup, setSelectedTeamGroup] = useState("All");

  useEffect(() => {
    async function loadRecords() {
      const recordsQuery = query(collection(db, "records"), orderBy("date", "desc"));
      const snapshot = await getDocs(recordsQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RecordRow, "id" | "teamName" | "gender" | "teamGroup">),
        teamName: (d.data() as { teamName?: string }).teamName || "NVFC",
        gender: (d.data() as { gender?: "boys" | "girls" }).gender || "boys",
        teamGroup: (d.data() as { teamGroup?: string }).teamGroup || "Senior",
      }));
      setRecords(rows);
      setLoading(false);
    }
    loadRecords();
  }, []);

  const seasons = useMemo(() => {
    const unique = new Set(records.map((r) => r.season).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [records]);

  const competitions = useMemo(() => {
    const unique = new Set(records.map((r) => r.competition).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [records]);

  const teamGroups = useMemo(() => {
    const unique = new Set(records.map((r) => r.teamGroup).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [records]);

  const filteredRecords = useMemo(() => {
    let list = records;
    if (selectedSeason !== "All") {
      list = list.filter((r) => r.season === selectedSeason);
    }
    if (selectedCompetition !== "All") {
      list = list.filter((r) => r.competition === selectedCompetition);
    }
    if (selectedTeamGroup !== "All") {
      list = list.filter((r) => r.teamGroup === selectedTeamGroup);
    }
    return list;
  }, [records, selectedSeason, selectedCompetition, selectedTeamGroup]);

  const boysRecords = useMemo(
    () => filteredRecords.filter((r) => r.gender === "boys"),
    [filteredRecords]
  );
  const girlsRecords = useMemo(
    () => filteredRecords.filter((r) => r.gender === "girls"),
    [filteredRecords]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Records</h1>
          <p className="text-gray-600">Match results and achievements</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
          >
            {competitions.map((competition) => (
              <option key={competition} value={competition}>
                {competition}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2"
            value={selectedTeamGroup}
            onChange={(e) => setSelectedTeamGroup(e.target.value)}
          >
            {teamGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </motion.div>

        {loading && (
          <div className="text-center text-gray-500">Loading records...</div>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="text-center text-gray-500">No records found.</div>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-nvfc-dark">Boys</h2>
                <span className="text-sm text-gray-500">{boysRecords.length} matches</span>
              </div>
              {boysRecords.length === 0 ? (
                <div className="text-center text-gray-500">No boys records found.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {boysRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3">
                              {record.teamLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={record.teamLogoUrl} alt={record.teamName} className="w-8 h-8 object-contain" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              )}
                              <h3 className="text-lg font-semibold text-nvfc-dark">
                                {record.teamName} vs {record.opponent}
                              </h3>
                              {record.opponentLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={record.opponentLogoUrl} alt={record.opponent} className="w-8 h-8 object-contain" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {record.date} • {record.venue || "TBD"}
                            </p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              record.result === "win"
                                ? "bg-green-100 text-green-700"
                                : record.result === "draw"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.result.toUpperCase()} {record.scoreline}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {record.competition} • {record.season} • {record.teamGroup}
                        </div>
                        {record.notes && <p className="text-sm text-gray-600 mb-3">{record.notes}</p>}
                        {record.highlightsUrl && (
                          <a
                            href={record.highlightsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-nvfc-primary hover:underline"
                          >
                            Watch highlights
                          </a>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-nvfc-dark">Girls</h2>
                <span className="text-sm text-gray-500">{girlsRecords.length} matches</span>
              </div>
              {girlsRecords.length === 0 ? (
                <div className="text-center text-gray-500">No girls records found.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {girlsRecords.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3">
                              {record.teamLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={record.teamLogoUrl} alt={record.teamName} className="w-8 h-8 object-contain" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              )}
                              <h3 className="text-lg font-semibold text-nvfc-dark">
                                {record.teamName} vs {record.opponent}
                              </h3>
                              {record.opponentLogoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={record.opponentLogoUrl} alt={record.opponent} className="w-8 h-8 object-contain" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {record.date} • {record.venue || "TBD"}
                            </p>
                          </div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              record.result === "win"
                                ? "bg-green-100 text-green-700"
                                : record.result === "draw"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.result.toUpperCase()} {record.scoreline}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {record.competition} • {record.season} • {record.teamGroup}
                        </div>
                        {record.notes && <p className="text-sm text-gray-600 mb-3">{record.notes}</p>}
                        {record.highlightsUrl && (
                          <a
                            href={record.highlightsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-nvfc-primary hover:underline"
                          >
                            Watch highlights
                          </a>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
