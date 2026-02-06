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

interface RecordRow {
  id: string;
  title: string;
  opponent: string;
  date: string;
  venue: string;
  competition: string;
  season: string;
  result: "win" | "draw" | "loss";
  scoreline: string;
  highlightsUrl?: string;
  notes?: string;
}

const emptyForm: RecordRow = {
  id: "",
  title: "",
  opponent: "",
  date: "",
  venue: "",
  competition: "League",
  season: "2025-26",
  result: "win",
  scoreline: "",
  highlightsUrl: "",
  notes: "",
};

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RecordRow>(emptyForm);
  const [loading, setLoading] = useState(true);
  const lockDays = 15;

  const isRecordLocked = (record: RecordRow) => {
    if (!record.date) return false;
    const recordDate = new Date(`${record.date}T00:00`);
    if (Number.isNaN(recordDate.getTime())) return false;
    const lockAt = new Date(recordDate.getTime() + lockDays * 24 * 60 * 60 * 1000);
    return new Date() > lockAt;
  };

  useEffect(() => {
    const recordsQuery = query(collection(db, "records"), orderBy("date", "desc"));
    const unsub = onSnapshot(recordsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<RecordRow, "id">),
      }));
      setRecords(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const exportCSV = () => {
    const headers = [
      "Title",
      "Opponent",
      "Date",
      "Venue",
      "Competition",
      "Season",
      "Result",
      "Scoreline",
      "Highlights URL",
      "Notes",
    ];
    const rows = records.map((r) => [
      r.title,
      r.opponent,
      r.date,
      r.venue,
      r.competition,
      r.season,
      r.result,
      r.scoreline,
      r.highlightsUrl ?? "",
      r.notes ?? "",
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
    link.download = `records-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const xlsx = await import("xlsx");
    const rows = records.map((r) => ({
      Title: r.title,
      Opponent: r.opponent,
      Date: r.date,
      Venue: r.venue,
      Competition: r.competition,
      Season: r.season,
      Result: r.result,
      Scoreline: r.scoreline,
      "Highlights URL": r.highlightsUrl ?? "",
      Notes: r.notes ?? "",
    }));
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Records");
    xlsx.writeFile(workbook, `records-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.opponent || !form.date || !form.scoreline) return;

    if (editingId) {
      const record = records.find((r) => r.id === editingId);
      if (record && isRecordLocked(record)) {
        alert(`This record is locked (older than ${lockDays} days).`);
        return;
      }
    }

    const payload = {
      title: form.title,
      opponent: form.opponent,
      date: form.date,
      venue: form.venue,
      competition: form.competition,
      season: form.season,
      result: form.result,
      scoreline: form.scoreline,
      highlightsUrl: form.highlightsUrl || "",
      notes: form.notes || "",
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "records", editingId), payload);
    } else {
      await addDoc(collection(db, "records"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: RecordRow) => {
    if (isRecordLocked(row)) {
      alert(`This record is locked (older than ${lockDays} days).`);
      return;
    }
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const deleteRecord = async (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record && isRecordLocked(record)) {
      alert(`This record is locked (older than ${lockDays} days).`);
      return;
    }
    if (!confirm("Delete this record?")) return;
    await deleteDoc(doc(db, "records", id));
  };

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Records Management</h1>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="ghost" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "Close" : "Add Record"}
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
                placeholder="Title (e.g., NVFC vs ABC)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Opponent"
                value={form.opponent}
                onChange={(e) => setForm({ ...form, opponent: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Competition"
                value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Season (e.g., 2025-26)"
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
              />
              <select
                className="border rounded-lg px-3 py-2"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value as RecordRow["result"] })}
              >
                <option value="win">Win</option>
                <option value="draw">Draw</option>
                <option value="loss">Loss</option>
              </select>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Scoreline (e.g., 2-1)"
                value={form.scoreline}
                onChange={(e) => setForm({ ...form, scoreline: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Highlights URL (optional)"
                value={form.highlightsUrl}
                onChange={(e) => setForm({ ...form, highlightsUrl: e.target.value })}
              />
              <textarea
                className="border rounded-lg px-3 py-2 md:col-span-3"
                placeholder="Notes (optional)"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update Record" : "Save Record"}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Competition</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Result</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      Loading records...
                    </td>
                  </tr>
                )}
                {!loading && records.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      No records found.
                    </td>
                  </tr>
                )}
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{r.title}</td>
                    <td className="px-6 py-4 text-gray-700">{r.date}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {r.competition} • {r.season}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          r.result === "win"
                            ? "bg-green-100 text-green-700"
                            : r.result === "draw"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.result.toUpperCase()} {r.scoreline}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(r)}
                          disabled={isRecordLocked(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteRecord(r.id)}
                          disabled={isRecordLocked(r)}
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
