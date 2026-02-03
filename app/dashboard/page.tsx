"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickLinks = [
    { title: "My Tickets", href: "/my-tickets", icon: "🎫", description: "View your booked tickets" },
    { title: "Order History", href: "/orders", icon: "📦", description: "Track your orders" },
    { title: "Membership", href: "/membership", icon: "⭐", description: "Manage your membership" },
    { title: "Profile Settings", href: "/profile", icon: "⚙️", description: "Update your information" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">
            Welcome back, {profile?.displayName || user.displayName}!
          </h1>
          <p className="text-gray-600">Manage your NVFC account and stay updated</p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-nvfc-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(profile?.displayName || user.displayName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-nvfc-dark">
                    {profile?.displayName || user.displayName}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-nvfc-secondary text-nvfc-dark text-xs font-semibold rounded-full">
                    {profile?.role === "admin" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={link.href}>
                <Card hover className="p-6 h-full">
                  <div className="text-4xl mb-3">{link.icon}</div>
                  <h3 className="text-lg font-bold text-nvfc-dark mb-2">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-nvfc-dark mb-4">Recent Activity</h2>
          <Card className="p-6">
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No recent activity</p>
              <p className="text-sm">Your tickets and orders will appear here</p>
            </div>
          </Card>
        </motion.div>

        {/* Admin Panel Link */}
        {profile?.role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Card className="p-6 bg-gradient-to-r from-nvfc-primary to-nvfc-accent text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Admin Access</h3>
                  <p className="text-gray-200">Manage content, users, and settings</p>
                </div>
                <Link href="/admin">
                  <Button variant="secondary">
                    Go to Admin Panel
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
