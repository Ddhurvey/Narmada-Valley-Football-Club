"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
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

const emptyForm: FixtureRow = {
  id: "",
  homeTeam: "",
  awayTeam: "",
  homeLogoUrl: "",
  awayLogoUrl: "",
  date: "",
  time: "",
  venue: "",
  competition: "League",
  status: "upcoming",
  homeScore: null,
  awayScore: null,
};

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<FixtureRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FixtureRow>(emptyForm);
  const [loading, setLoading] = useState(true);
  const lockDays = 15;

  const isFixtureLocked = (fixture: FixtureRow) => {
    if (!fixture.date) return false;
    const time = fixture.time || "00:00";
    const fixtureDate = new Date(`${fixture.date}T${time}`);
    if (Number.isNaN(fixtureDate.getTime())) return false;
    const lockAt = new Date(fixtureDate.getTime() + lockDays * 24 * 60 * 60 * 1000);
    return new Date() > lockAt;
  };

  const exportCSV = () => {
    const headers = [
      "Home Team",
      "Away Team",
      "Date",
      "Time",
      "Venue",
      "Competition",
      "Status",
      "Home Score",
      "Away Score",
      "Home Logo URL",
      "Away Logo URL",
    ];
    const rows = fixtures.map((f) => [
      f.homeTeam,
      f.awayTeam,
      f.date,
      f.time,
      f.venue,
      f.competition,
      f.status,
      f.homeScore ?? "",
      f.awayScore ?? "",
      f.homeLogoUrl ?? "",
      f.awayLogoUrl ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `${String(value).replace(/"/g, '""')}`)
          .map((value) => (value.includes(",") || value.includes("\n") ? `"${value}"` : value))
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fixtures-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const xlsx = await import("xlsx");
    const rows = fixtures.map((f) => ({
      "Home Team": f.homeTeam,
      "Away Team": f.awayTeam,
      Date: f.date,
      Time: f.time,
      Venue: f.venue,
      Competition: f.competition,
      Status: f.status,
      "Home Score": f.homeScore ?? "",
      "Away Score": f.awayScore ?? "",
      "Home Logo URL": f.homeLogoUrl ?? "",
      "Away Logo URL": f.awayLogoUrl ?? "",
    }));
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Fixtures");
    xlsx.writeFile(workbook, `fixtures-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  useEffect(() => {
    const fixturesQuery = query(collection(db, "fixtures"), orderBy("date", "desc"));
    const unsub = onSnapshot(fixturesQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FixtureRow, "id">),
      }));
      setFixtures(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.homeTeam || !form.awayTeam || !form.date || !form.time) return;
    if (editingId) {
      const fixture = fixtures.find((f) => f.id === editingId);
      if (fixture && isFixtureLocked(fixture)) {
        alert(`This fixture is locked (older than ${lockDays} days).`);
        return;
      }
    }

    const payload = {
      homeTeam: form.homeTeam,
      awayTeam: form.awayTeam,
      homeLogoUrl: form.homeLogoUrl || "",
      awayLogoUrl: form.awayLogoUrl || "",
      date: form.date,
      time: form.time,
      venue: form.venue,
      competition: form.competition,
      status: form.status,
      homeScore: form.homeScore ?? null,
      awayScore: form.awayScore ?? null,
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "fixtures", editingId), payload);
    } else {
      await addDoc(collection(db, "fixtures"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: FixtureRow) => {
    if (isFixtureLocked(row)) {
      alert(`This fixture is locked (older than ${lockDays} days).`);
      return;
    }
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const updateStatus = async (id: string, status: FixtureRow["status"]) => {
    const fixture = fixtures.find((f) => f.id === id);
    if (fixture && isFixtureLocked(fixture)) {
      alert(`This fixture is locked (older than ${lockDays} days).`);
      return;
    }
    await updateDoc(doc(db, "fixtures", id), { status, updatedAt: Timestamp.now() });
  };

  const deleteFixture = async (id: string) => {
    const fixture = fixtures.find((f) => f.id === id);
    if (fixture && isFixtureLocked(fixture)) {
      alert(`This fixture is locked (older than ${lockDays} days).`);
      return;
    }
    if (!confirm("Delete this fixture?")) return;
    await deleteDoc(doc(db, "fixtures", id));
  };

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Fixture Management</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="ghost" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Close" : "Add Fixture"}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Records older than {lockDays} days are locked from edits.
        </p>

        {showForm && (
          <Card className="p-6 mb-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Home Team"
                value={form.homeTeam}
                onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Away Team"
                value={form.awayTeam}
                onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Home Logo URL"
                value={form.homeLogoUrl}
                onChange={(e) => setForm({ ...form, homeLogoUrl: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Away Logo URL"
                value={form.awayLogoUrl}
                onChange={(e) => setForm({ ...form, awayLogoUrl: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Competition"
                value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Home Score"
                type="number"
                value={form.homeScore ?? ""}
                onChange={(e) => setForm({ ...form, homeScore: e.target.value === "" ? null : Number(e.target.value) })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Away Score"
                type="number"
                value={form.awayScore ?? ""}
                onChange={(e) => setForm({ ...form, awayScore: e.target.value === "" ? null : Number(e.target.value) })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FixtureRow["status"] })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update Fixture" : "Save Fixture"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyForm);
                      setShowForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Match</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Venue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      Loading fixtures...
                    </td>
                  </tr>
                )}
                {!loading && fixtures.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      No fixtures found.
                    </td>
                  </tr>
                )}
                {fixtures.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {f.homeTeam} vs {f.awayTeam}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {f.date} • {f.time}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{f.venue}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {f.status === "completed" ? `${f.homeScore ?? 0} - ${f.awayScore ?? 0}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          f.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(f)}
                          disabled={isFixtureLocked(f)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(f.id, "upcoming")}
                          disabled={isFixtureLocked(f)}
                        >
                          Upcoming
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(f.id, "completed")}
                          disabled={isFixtureLocked(f)}
                        >
                          Completed
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteFixture(f.id)}
                          disabled={isFixtureLocked(f)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
