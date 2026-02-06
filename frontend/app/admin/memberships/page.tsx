"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MembershipRow {
  id: string;
  userId?: string;
  plan?: string;
  status?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt?: Timestamp;
}

const formatDate = (value?: Timestamp) => {
  if (!value) return "-";
  try {
    return value.toDate().toLocaleDateString();
  } catch {
    return "-";
  }
};

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const membershipsQuery = query(collection(db, "memberships"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(membershipsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MembershipRow, "id">),
      }));
      setMemberships(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Memberships</h1>
          <p className="text-gray-600">All membership subscriptions</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Start</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">End</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      Loading memberships...
                    </td>
                  </tr>
                )}
                {!loading && memberships.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      No memberships found.
                    </td>
                  </tr>
                )}
                {memberships.map((membership) => (
                  <tr key={membership.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{membership.userId || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{membership.plan || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{membership.status || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(membership.startDate)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(membership.endDate)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(membership.createdAt)}</td>
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
