"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
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

interface TeamRow {
  id: string;
  slug: string;
  label: string;
  order: number;
  createdAt?: Timestamp;
}

const emptyForm: TeamRow = {
  id: "",
  slug: "",
  label: "",
  order: 0,
};

export default function AdminTeamsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [form, setForm] = useState<TeamRow>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const teamsQuery = query(collection(db, "teams"), orderBy("order", "asc"));
    const unsub = onSnapshot(teamsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamRow, "id">),
      }));
      setTeams(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.label) return;

    const payload = {
      slug: form.slug.trim(),
      label: form.label.trim(),
      order: Number.isFinite(form.order) ? form.order : 0,
      updatedAt: Timestamp.now(),
    };

    if (editingId) {
      await updateDoc(doc(db, "teams", editingId), payload);
    } else {
      await addDoc(collection(db, "teams"), {
        ...payload,
        createdAt: Timestamp.now(),
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (row: TeamRow) => {
    setForm({ ...row });
    setEditingId(row.id);
    setShowForm(true);
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    await deleteDoc(doc(db, "teams", id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-nvfc-dark">Teams Manager</h1>
            <p className="text-gray-600">Manage squad dropdown teams</p>
          </div>
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "Add Team"}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Team Label (e.g., Boys U22)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                placeholder="Team Slug (e.g., boys-u22)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              <input
                className="border rounded-lg px-3 py-2"
                type="number"
                placeholder="Order (0-100)"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
              <div className="md:col-span-3 flex gap-3">
                <Button type="submit" variant="secondary">
                  {isEditing ? "Update Team" : "Save Team"}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Label</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={4}>
                      Loading teams...
                    </td>
                  </tr>
                )}
                {!loading && teams.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={4}>
                      No teams found.
                    </td>
                  </tr>
                )}
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{team.label}</td>
                    <td className="px-6 py-4 text-gray-700">{team.slug}</td>
                    <td className="px-6 py-4 text-gray-700">{team.order}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(team)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteTeam(team.id)}
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
