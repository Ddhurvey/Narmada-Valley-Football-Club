"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  getAllUsers,
  createAdmin,
  removeAdmin,
  blockUser,
  unblockUser,
  createSuperAdminTransferRequest,
  getTransferRequestForUser,
  getAllTransferRequests,
  acceptTransferRequest,
  completeTransferRequest,
  type SuperAdminTransferRequest,
} from "@/lib/admin";
import { PERMISSIONS, ROLES } from "@/lib/roles";
import type { UserProfile } from "@/lib/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function RoleManagementPage() {
  const { user, isSuperAdmin, can, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transferRequest, setTransferRequest] = useState<SuperAdminTransferRequest | null>(null);
  const [allTransferRequests, setAllTransferRequests] = useState<SuperAdminTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isSuperAdmin, router]);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      setLoading(false);
    }
  }, [authLoading, isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);

        if (user) {
          if (isSuperAdmin) {
            const requests = await getAllTransferRequests();
            setAllTransferRequests(requests);
          } else {
            const req = await getTransferRequestForUser(user.uid);
            setTransferRequest(req);
          }
        }
        
        if (allUsers.length === 0) {
            // If legitimate 0 users (unlikely) or masked error
        }
    } catch (e: any) {
         console.error("Failed to load users:", e);
         setError("Failed to load users. Connection to database might be blocked (Firewall/AdBlocker).");
    }
    setLoading(false);
  }

  async function handleSendTransferRequest(targetUser: UserProfile) {
    if (!user || !user.email) return;

    const confirmed = confirm(`Send Super Admin transfer request to ${targetUser.displayName}?`);
    if (!confirmed) return;

    setActionLoading(targetUser.uid);
    const result = await createSuperAdminTransferRequest(user.uid, user.email, targetUser);
    if (result.success) {
      await loadUsers();
      alert("Transfer request sent. Admin must accept.");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  async function handleAcceptTransfer() {
    if (!user) return;
    setActionLoading(user.uid);
    const result = await acceptTransferRequest(user.uid);
    if (result.success) {
      await loadUsers();
      alert("Request accepted. Wait for Super Admin to complete transfer.");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
  }

  async function handleCompleteTransfer(targetUID: string) {
    if (!user) return;
    const confirmed = confirm("This will transfer Super Admin to the selected admin. Continue?");
    if (!confirmed) return;
    setActionLoading(targetUID);
    const result = await completeTransferRequest(user.uid, targetUID);
    if (result.success) {
      alert("Transfer completed. You are now Admin.");
      await loadUsers();
      router.push("/dashboard");
    } else {
      alert(`Error: ${result.error}`);
    }
    setActionLoading(null);
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

        {/* Super Admin Transfer */}
        {!loading && user && (
          <div className="mb-6">
            {isSuperAdmin ? (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-nvfc-dark mb-2">Super Admin Transfer</h2>
                <p className="text-sm text-gray-600 mb-4">Send a transfer request to an Admin. They must accept.</p>
                <div className="space-y-3">
                  {users
                    .filter((u) => u.role === ROLES.ADMIN)
                    .map((admin) => {
                      const existingReq = allTransferRequests.find((r) => r.targetUID === admin.uid && r.status !== "completed");
                      return (
                        <div key={admin.uid} className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-medium text-gray-900">{admin.displayName}</div>
                            <div className="text-sm text-gray-600">{admin.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {existingReq?.status === "pending" && (
                              <span className="text-xs text-yellow-600">Pending</span>
                            )}
                            {existingReq?.status === "accepted" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleCompleteTransfer(admin.uid)}
                                isLoading={actionLoading === admin.uid}
                              >
                                Complete Transfer
                              </Button>
                            )}
                            {!existingReq && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSendTransferRequest(admin)}
                                isLoading={actionLoading === admin.uid}
                              >
                                Send Request
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {users.filter((u) => u.role === ROLES.ADMIN).length === 0 && (
                    <div className="text-sm text-gray-600">No Admins available for transfer.</div>
                  )}
                </div>
              </Card>
            ) : (
              transferRequest?.status === "pending" && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-nvfc-dark mb-2">Super Admin Transfer Request</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    You have a request from {transferRequest.invitedByEmail}. Accept to become Super Admin.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleAcceptTransfer}
                    isLoading={actionLoading === user.uid}
                  >
                    Accept Request
                  </Button>
                </Card>
              )
            )}
          </div>
        )}

        {/* Self-Heal Banner: If current user is missing from DB list */}
        {user && !users.find(u => u.uid === user.uid) && !loading && (
             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-bold">Profile Missing:</span> Your user profile was not found in the database (likely due to network block during login).
                            </p>
                        </div>
                    </div>
                    <Button 
                        size="sm" 
                        variant="primary"
                        onClick={async () => {
                            if (!user) return;
                            try {
                                setLoading(true);
                                // Manual import to avoid conflicts
                                const { doc, setDoc, Timestamp } = await import("firebase/firestore");
                                const { db } = await import("@/lib/firebase");
                                const { ROLES, USER_STATUS } = await import("@/lib/roles"); // Assuming this path
                                
                                await setDoc(doc(db, "users", user.uid), {
                                    uid: user.uid,
                                    email: user.email,
                                    displayName: user.displayName || "Admin",
                                    role: ROLES.SUPER_ADMIN, // Use correct constant
                                    status: "active",
                                    createdAt: Timestamp.now(),
                                    updatedAt: Timestamp.now()
                                });
                                alert("Profile Synced! Reloading...");
                                loadUsers();
                            } catch (e: any) {
                                alert("Sync Failed: " + e.message);
                                setLoading(false);
                            }
                        }}
                    >
                        Fix Profile
                    </Button>
                </div>
            </div>
        )}

        {/* Error Banner */}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        )}

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
                            {/* Cannot modify Super Admin OR Self */}
                            {isTargetSuperAdmin || isCurrentUser ? (
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
