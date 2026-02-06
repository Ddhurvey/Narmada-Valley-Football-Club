"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface NavLinkItem {
  href: string;
  label: string;
  children?: NavLinkItem[];
}

const defaultNavLinks: NavLinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/records", label: "Records" },
  {
    href: "/players",
    label: "Squad",
    children: [
      { href: "/players?team=boys", label: "Boys Team" },
      { href: "/players?team=boys-u15", label: "Boys U15" },
      { href: "/players?team=boys-u18", label: "Boys U18" },
      { href: "/players?team=boys-u19", label: "Boys U19" },
      { href: "/players?team=girls", label: "Girls Team" },
      { href: "/players?team=girls-u15", label: "Girls U15" },
      { href: "/players?team=girls-u18", label: "Girls U18" },
      { href: "/players?team=girls-u19", label: "Girls U19" },
    ],
  },
  { href: "/tickets", label: "Tickets" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "Club" },
];

export default function AdminNavigationPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<NavLinkItem[]>(defaultNavLinks);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    async function loadNavigation() {
      try {
        const navDoc = await getDoc(doc(db, "settings", "navigation"));
        if (navDoc.exists()) {
          const data = navDoc.data() as { links?: NavLinkItem[] };
          if (Array.isArray(data.links) && data.links.length > 0) {
            setLinks(data.links);
          }
        }
      } catch (error) {
        console.error("Error loading navigation:", error);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) loadNavigation();
  }, [isAdmin]);

  const squadIndex = useMemo(() => links.findIndex((link) => link.href === "/players"), [links]);

  const updateLink = (index: number, key: "label" | "href", value: string) => {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const updateChild = (parentIndex: number, childIndex: number, key: "label" | "href", value: string) => {
    setLinks((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      const children = parent.children ? [...parent.children] : [];
      children[childIndex] = { ...children[childIndex], [key]: value } as NavLinkItem;
      next[parentIndex] = { ...parent, children };
      return next;
    });
  };

  const addChild = (parentIndex: number) => {
    setLinks((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      const children = parent.children ? [...parent.children] : [];
      children.push({ href: "/players?team=new-team", label: "New Team" });
      next[parentIndex] = { ...parent, children };
      return next;
    });
  };

  const removeChild = (parentIndex: number, childIndex: number) => {
    setLinks((prev) => {
      const next = [...prev];
      const parent = next[parentIndex];
      const children = parent.children ? [...parent.children] : [];
      children.splice(childIndex, 1);
      next[parentIndex] = { ...parent, children };
      return next;
    });
  };

  const resetDefaults = () => {
    setLinks(defaultNavLinks);
  };

  const saveNavigation = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "navigation"),
        {
          links,
          updatedAt: Timestamp.now(),
          updatedBy: user.uid,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving navigation:", error);
      alert("Failed to save navigation.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
            <h1 className="text-3xl font-bold text-nvfc-dark">Navigation Manager</h1>
            <p className="text-gray-600">Edit navbar labels and team names</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={resetDefaults} disabled={saving}>
              Reset Defaults
            </Button>
            <Button variant="primary" onClick={saveNavigation} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Top-Level Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link, index) => (
              <div key={`${link.href}-${index}`} className="grid grid-cols-1 gap-2">
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(index, "label", e.target.value)}
                />
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="Href"
                  value={link.href}
                  onChange={(e) => updateLink(index, "href", e.target.value)}
                />
              </div>
            ))}
          </div>
        </Card>

        {squadIndex >= 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Squad Dropdown Items</h2>
              <Button variant="outline" size="sm" onClick={() => addChild(squadIndex)}>
                Add Team
              </Button>
            </div>
            <div className="space-y-4">
              {links[squadIndex].children?.map((child, childIndex) => (
                <div key={`${child.href}-${childIndex}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <input
                    className="border rounded-lg px-3 py-2 md:col-span-2"
                    placeholder="Team Label"
                    value={child.label}
                    onChange={(e) => updateChild(squadIndex, childIndex, "label", e.target.value)}
                  />
                  <input
                    className="border rounded-lg px-3 py-2 md:col-span-2"
                    placeholder="Team Link"
                    value={child.href}
                    onChange={(e) => updateChild(squadIndex, childIndex, "href", e.target.value)}
                  />
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeChild(squadIndex, childIndex)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
