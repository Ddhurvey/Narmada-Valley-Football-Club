"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getAuditLogs } from "@/lib/admin";
import type { AuditLog } from "@/lib/admin";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

export default function AuditLogsPage() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push("/admin");
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadLogs();
    }
  }, [isSuperAdmin]);

  async function loadLogs() {
    setLoading(true);
    const auditLogs = await getAuditLogs(100);
    setLogs(auditLogs);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  const filteredLogs = filter === "all" ? logs : logs.filter((log) => log.action.includes(filter.toUpperCase()));

  const actionTypes = ["all", "user", "admin", "layout", "content"];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Audit Logs</h1>
          <p className="text-gray-600">System activity tracking (Super Admin Only)</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {actionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === type ? "bg-nvfc-primary text-white" : "bg-white text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Resource</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.timestamp.toDate().toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          log.action.includes("CREATE")
                            ? "bg-green-100 text-green-700"
                            : log.action.includes("DELETE")
                            ? "bg-red-100 text-red-700"
                            : log.action.includes("BLOCK")
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.resource}: {log.resourceId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.changes ? JSON.stringify(log.changes).slice(0, 50) + "..." : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No audit logs found</div>
        )}
      </div>
    </div>
  );
}
