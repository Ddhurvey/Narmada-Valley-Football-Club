"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface TicketRow {
  id: string;
  userId?: string;
  match?: string;
  event?: string;
  fixture?: string;
  quantity?: number;
  total?: number;
  status?: string;
  createdAt?: Timestamp;
}

const formatDate = (value?: Timestamp) => {
  if (!value) return "-";
  try {
    return value.toDate().toLocaleString();
  } catch {
    return "-";
  }
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ticketsQuery = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(ticketsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TicketRow, "id">),
      }));
      setTickets(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Ticket Orders</h1>
          <p className="text-gray-600">All ticket purchases and bookings</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Match</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Qty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      Loading tickets...
                    </td>
                  </tr>
                )}
                {!loading && tickets.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={6}>
                      No tickets found.
                    </td>
                  </tr>
                )}
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{ticket.userId || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {ticket.match || ticket.event || ticket.fixture || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{ticket.quantity ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{ticket.total ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{ticket.status || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(ticket.createdAt)}</td>
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
