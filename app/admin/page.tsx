"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/");
    return null;
  }

  const adminSections = [
    { title: "Role Management", icon: "👥", href: "/admin/roles", color: "purple", adminOnly: true },
    { title: "News & Articles", icon: "📰", href: "/admin/news", color: "blue" },
    { title: "Players", icon: "⚽", href: "/admin/players", color: "green" },
    { title: "Fixtures", icon: "📅", href: "/admin/fixtures", color: "orange" },
    { title: "Products", icon: "🛍️", href: "/admin/products", color: "pink" },
    { title: "Layouts", icon: "🎨", href: "/admin/layouts", color: "indigo" },
    { title: "Events", icon: "🎉", href: "/admin/events", color: "yellow" },
    { title: "Audit Logs", icon: "📋", href: "/admin/audit", color: "gray", adminOnly: true },
  ];

  const stats = [
    { label: "Total Users", value: "1,234", icon: "👤", color: "blue" },
    { label: "Active Members", value: "567", icon: "⭐", color: "yellow" },
    { label: "Tickets Sold", value: "2,890", icon: "🎫", color: "green" },
    { label: "Revenue", value: "₹4.5L", icon: "💰", color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your club's digital presence</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{stat.icon}</span>
                  <span className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</span>
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={section.href}>
                <Card hover className="p-6 text-center h-full cursor-pointer group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {section.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{section.title}</h3>
                  {section.adminOnly && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Super Admin Only
                    </span>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="p-6">
            <h2 className="text-xl font-bold text-nvfc-dark mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Create News Article</Button>
              <Button variant="outline">Add Player</Button>
              <Button variant="outline">Schedule Match</Button>
              <Button variant="outline">Add Product</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
