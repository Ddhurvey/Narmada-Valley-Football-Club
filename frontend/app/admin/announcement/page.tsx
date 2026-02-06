"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

interface AnnouncementConfig {
  enabled: boolean;
  message: string;
  style: "static" | "scroll";
  bgColor: string;
  textColor: string;
  speedSec: number;
  startAt?: string;
  endAt?: string;
  updatedAt?: any;
}

const defaultConfig: AnnouncementConfig = {
  enabled: false,
  message: "Important update from NVFC",
  style: "scroll",
  bgColor: "#e63946",
  textColor: "#ffffff",
  speedSec: 20,
  startAt: "",
  endAt: "",
};

export default function AnnouncementAdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AnnouncementConfig>(defaultConfig);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    async function loadConfig() {
      const snap = await getDoc(doc(db, "announcements", "global"));
      if (snap.exists()) {
        setConfig({ ...defaultConfig, ...(snap.data() as AnnouncementConfig) });
      }
      setLoading(false);
    }
    if (isAdmin) {
      loadConfig();
    }
  }, [isAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, "announcements", "global"), {
      ...config,
      updatedAt: Timestamp.now(),
    });
    alert("Announcement updated");
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Important Message Banner</h1>
          <p className="text-gray-600">Configure the top announcement bar</p>
        </motion.div>

        <Card className="p-6">
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              />
              <span className="text-sm font-medium">Enable announcement</span>
            </div>

            <Input
              label="Message"
              name="message"
              required
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={config.style}
                  onChange={(e) => setConfig({ ...config, style: e.target.value as AnnouncementConfig["style"] })}
                >
                  <option value="scroll">Scrolling (Marquee)</option>
                  <option value="static">Static Center</option>
                </select>
              </div>
              <Input
                label="Speed (seconds)"
                name="speedSec"
                type="number"
                value={config.speedSec}
                onChange={(e) => setConfig({ ...config, speedSec: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Background Color"
                name="bgColor"
                value={config.bgColor}
                onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
              />
              <Input
                label="Text Color"
                name="textColor"
                value={config.textColor}
                onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start At"
                name="startAt"
                type="datetime-local"
                value={config.startAt || ""}
                onChange={(e) => setConfig({ ...config, startAt: e.target.value })}
              />
              <Input
                label="End At"
                name="endAt"
                type="datetime-local"
                value={config.endAt || ""}
                onChange={(e) => setConfig({ ...config, endAt: e.target.value })}
              />
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Save Announcement
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
