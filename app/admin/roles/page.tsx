"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getAllUsers, createAdmin, removeAdmin, blockUser, unblockUser } from "@/lib/admin";
import { PERMISSIONS, ROLES } from "@/lib/roles";
import type { UserProfile } from "@/lib/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function RoleManagementPage() {
  const { user, isSuperAdmin, can, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  async function loadUsers() {
    setLoading(true);
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  }

  async function handlePromoteToAdmin(targetUser: UserProfile) {
    if (!user) return;

    const confirmed = confirm(`Promote ${targetUser.displayName} to Admin?`);
    if (!confirmed) return;

    setActionLoading(targetUser.uid);
    const result = await createAdmin(
      user.uid,
      targetUser.uid,
      targetUser.email,
      targetUser.displayName
    );

    if (result.success) {
      await loadUsers();
      alert("User promoted to Admin successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  async function handleRemoveAdmin(targetUser: UserProfile) {
    if (!user) return;

    const confirmed = confirm(`Remove Admin role from ${targetUser.displayName}?`);
    if (!confirmed) return;

    setActionLoading(targetUser.uid);
    const result = await removeAdmin(user.uid, targetUser.uid);

    if (result.success) {
      await loadUsers();
      alert("Admin role removed successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  async function handleBlockUser(targetUser: UserProfile) {
    if (!user) return;

    const confirmed = confirm(`Block ${targetUser.displayName}?`);
    if (!confirmed) return;

    setActionLoading(targetUser.uid);
    const result = await blockUser(user.uid, targetUser.uid);

    if (result.success) {
      await loadUsers();
      alert("User blocked successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  async function handleUnblockUser(targetUser: UserProfile) {
    if (!user) return;

    const confirmed = confirm(`Unblock ${targetUser.displayName}?`);
    if (!confirmed) return;

    setActionLoading(targetUser.uid);
    const result = await unblockUser(user.uid, targetUser.uid);

    if (result.success) {
      await loadUsers();
      alert("User unblocked successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions (Super Admin Only)</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Users", value: users.length },
            { label: "Super Admins", value: users.filter((u) => u.role === ROLES.SUPER_ADMIN).length },
            { label: "Admins", value: users.filter((u) => u.role === ROLES.ADMIN).length },
            { label: "Blocked Users", value: users.filter((u) => u.status === "blocked").length },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-nvfc-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((targetUser) => {
                    const isCurrentUser = targetUser.uid === user?.uid;
                    const isTargetSuperAdmin = targetUser.role === ROLES.SUPER_ADMIN;

                    return (
                      <tr key={targetUser.uid} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-nvfc-primary rounded-full flex items-center justify-center text-white font-bold">
                              {targetUser.displayName[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {targetUser.displayName}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-nvfc-primary">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{targetUser.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              targetUser.role === ROLES.SUPER_ADMIN
                                ? "bg-purple-100 text-purple-700"
                                : targetUser.role === ROLES.ADMIN
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {targetUser.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              targetUser.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {targetUser.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {targetUser.createdAt.toDate().toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* Cannot modify Super Admin */}
                            {isTargetSuperAdmin ? (
                              <span className="text-xs text-gray-400 italic">Protected</span>
                            ) : (
                              <>
                                {/* Promote to Admin */}
                                {targetUser.role === ROLES.USER && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePromoteToAdmin(targetUser)}
                                    isLoading={actionLoading === targetUser.uid}
                                  >
                                    Make Admin
                                  </Button>
                                )}

                                {/* Remove Admin */}
                                {targetUser.role === ROLES.ADMIN && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAdmin(targetUser)}
                                    isLoading={actionLoading === targetUser.uid}
                                  >
                                    Remove Admin
                                  </Button>
                                )}

                                {/* Block/Unblock */}
                                {targetUser.status === "active" ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBlockUser(targetUser)}
                                    isLoading={actionLoading === targetUser.uid}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Block
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnblockUser(targetUser)}
                                    isLoading={actionLoading === targetUser.uid}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Unblock
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
