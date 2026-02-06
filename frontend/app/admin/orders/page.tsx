"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface OrderRow {
  id: string;
  userId?: string;
  status?: string;
  total?: number;
  items?: unknown[];
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(ordersQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OrderRow, "id">),
      }));
      setOrders(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-custom py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nvfc-dark">Store Orders</h1>
          <p className="text-gray-600">All merchandise orders</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      Loading orders...
                    </td>
                  </tr>
                )}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-500" colSpan={5}>
                      No orders found.
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{order.userId || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{order.items ? order.items.length : 0}</td>
                    <td className="px-6 py-4 text-gray-700">{order.total ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{order.status || "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(order.createdAt)}</td>
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
