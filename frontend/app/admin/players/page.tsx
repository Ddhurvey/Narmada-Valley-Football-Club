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

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  number: string;
  team: "boys" | "girls" | "u18" | "u15" | "u14";
  nationality: string;
  dob: string;
  heightCm: string;
  weightKg: string;
  photoURL?: string;
  idProofUrl?: string;
  bio?: string;
  joined?: string;
  contract?: string;
  status: "active" | "injured" | "loan" | "left";
}

const emptyForm: PlayerRow = {
  id: "",
  name: "",
  position: "",
  number: "",
  team: "boys",
  nationality: "",
  dob: "",
  heightCm: "",
  weightKg: "",
  photoURL: "",
  idProofUrl: "",
  bio: "",
  joined: "",
  contract: "",
  status: "active",
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlayerRow>(emptyForm);
  const [loading, setLoading] = useState(true);

  const exportCSV = () => {
    const headers = [
      "Name",
      "Position",
      "Number",
      "Team",
      "Nationality",
      "DOB",
      "Height (cm)",
      "Weight (kg)",
      "Status",
      "Photo URL",
      "ID Proof URL",
      "Bio",
      "Joined",
      "Contract",
    ];
    const rows = players.map((p) => [
      p.name,
      p.position,
      p.number,
      p.team,
      p.nationality,
      p.dob,
      p.heightCm,
      p.weightKg,
      p.status,
      p.photoURL ?? "",
      p.idProofUrl ?? "",
      p.bio ?? "",
      p.joined ?? "",
      p.contract ?? "",
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
    link.download = `players-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const xlsx = await import("xlsx");
    const rows = players.map((p) => ({
      Name: p.name,
      Position: p.position,
      Number: p.number,
      Team: p.team,
      Nationality: p.nationality,
      DOB: p.dob,
      "Height (cm)": p.heightCm,
      "Weight (kg)": p.weightKg,
      Status: p.status,
      "Photo URL": p.photoURL ?? "",
      "ID Proof URL": p.idProofUrl ?? "",
      Bio: p.bio ?? "",
      Joined: p.joined ?? "",
      Contract: p.contract ?? "",
    }));
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Players");
    xlsx.writeFile(workbook, `players-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  useEffect(() => {
    const playersQuery = query(collection(db, "players"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(playersQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        team: "boys",
        ...(d.data() as Omit<PlayerRow, "id" | "team">),
      }));
      setPlayers(rows);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.position || !form.number || !form.dob) return;

    const payload = {
      name: form.name,
      position: form.position,
      number: form.number,
      team: form.team,
      nationality: form.nationality,
      dob: form.dob,
      heightCm: form.heightCm,
      weightKg: form.weightKg,
      photoURL: form.photoURL || "",
      idProofUrl: form.idProofUrl || "",
      bio: form.bio || "",
      joined: form.joined || "",
      contract: form.contract || "",
      status: form.status,
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "players", editingId), payload);
    } else {
      await addDoc(collection(db, "players"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: PlayerRow) => {
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const updateStatus = async (id: string, status: PlayerRow["status"]) => {
    await updateDoc(doc(db, "players", id), { status, updatedAt: Timestamp.now() });
  };

  const deletePlayer = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    await deleteDoc(doc(db, "players", id));
  };

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Player Management</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="ghost" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Close" : "Add Player"}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Player name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Jersey #"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value as PlayerRow["team"] })}
              >
                <option value="boys">Boys Team</option>
                <option value="girls">Girls Team</option>
                <option value="u18">U18</option>
                <option value="u15">U15</option>
                <option value="u14">U14</option>
              </select>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Nationality"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                placeholder="Date of Birth"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Height (cm)"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Weight (kg)"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Photo URL"
                value={form.photoURL}
                onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="ID Proof URL"
                value={form.idProofUrl}
                onChange={(e) => setForm({ ...form, idProofUrl: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                placeholder="Joined Date"
                value={form.joined}
                onChange={(e) => setForm({ ...form, joined: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                placeholder="Contract End"
                value={form.contract}
                onChange={(e) => setForm({ ...form, contract: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PlayerRow["status"] })}
              >
                <option value="active">Active</option>
                <option value="injured">Injured</option>
                <option value="loan">On Loan</option>
                <option value="left">Left Club</option>
              </select>
              <textarea
                className="border rounded-lg px-3 py-2 md:col-span-3"
                placeholder="Short bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update Player" : "Save Player"}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Team</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">DOB</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Height</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Weight</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={9}>
                      Loading players...
                    </td>
                  </tr>
                )}
                {!loading && players.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={9}>
                      No players found.
                    </td>
                  </tr>
                )}
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        {p.photoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photoURL} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-nvfc-primary text-white flex items-center justify-center">
                            {p.name?.[0] || "P"}
                          </div>
                        )}
                        <div>
                          <div>{p.name}</div>
                          {p.idProofUrl && (
                            <a href={p.idProofUrl} className="text-xs text-blue-600" target="_blank" rel="noreferrer">
                              View ID Proof
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.position}</td>
                    <td className="px-6 py-4 text-gray-700">{p.number}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {p.team === "boys" && "Boys"}
                      {p.team === "girls" && "Girls"}
                      {p.team === "u18" && "U18"}
                      {p.team === "u15" && "U15"}
                      {p.team === "u14" && "U14"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.dob || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{p.heightCm ? `${p.heightCm} cm` : "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{p.weightKg ? `${p.weightKg} kg` : "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === "active"
                            ? "bg-green-100 text-green-700"
                            : p.status === "injured"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(p)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(p.id, "active")}>
                          Active
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(p.id, "injured")}>
                          Injured
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(p.id, "loan")}>
                          Loan
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(p.id, "left")}>
                          Left
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deletePlayer(p.id)}
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
