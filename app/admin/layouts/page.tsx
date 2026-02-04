"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getPageLayouts, activateLayout, createLayout } from "@/lib/layouts";
import type { LayoutConfig, SectionType } from "@/types/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";

const availableSections: { type: SectionType; icon: string; name: string }[] = [
  { type: "hero", icon: "🎯", name: "Hero Section" },
  { type: "news", icon: "📰", name: "News Feed" },
  { type: "fixtures", icon: "📅", name: "Fixtures" },
  { type: "players", icon: "⚽", name: "Players" },
  { type: "gallery", icon: "🖼️", name: "Gallery" },
  { type: "sponsors", icon: "🤝", name: "Sponsors" },
  { type: "stats", icon: "📊", name: "Statistics" },
  { type: "countdown", icon: "⏱️", name: "Countdown" },
  { type: "cta", icon: "📣", name: "Call to Action" },
];

export default function LayoutsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [layouts, setLayouts] = useState<LayoutConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("home");
  const [editMode, setEditMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([]);

  const pages = ["home", "news", "fixtures", "players", "about", "contact"];

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadLayouts();
    }
  }, [isAdmin, selectedPage]);

  async function loadLayouts() {
    setLoading(true);
    const pageLayouts = await getPageLayouts(selectedPage);
    setLayouts(pageLayouts);
    setLoading(false);
  }

  async function handleActivateLayout(layoutId: string) {
    const confirmed = confirm("Activate this layout? It will replace the current active layout.");
    if (!confirmed) return;

    const result = await activateLayout(layoutId);
    if (result.success) {
      alert("Layout activated successfully!");
      loadLayouts();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  async function handleCreateLayout() {
    if (!user || selectedSections.length === 0) {
      alert("Please add at least one section");
      return;
    }

    const sections = selectedSections.map((type, index) => ({
      id: `section-${index}`,
      type,
      order: index,
      visible: true,
      config: {},
    }));

    const result = await createLayout({
      page: selectedPage,
      name: `${selectedPage} Layout ${new Date().toLocaleDateString()}`,
      active: false,
      year: new Date().getFullYear(),
      layoutTemplate: "custom",
      sections,
      theme: {
        name: "NVFC Default",
        colors: {
          primary: "#1a1a2e",
          secondary: "#16213e",
          accent: "#0f3460",
          dark: "#0a0e27",
          light: "#f5f5f5",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
          background: "#ffffff",
          surface: "#f9fafb",
          text: { primary: "#1f2937", secondary: "#6b7280", disabled: "#9ca3af" },
        },
        typography: {
          fontFamily: { display: "Outfit", body: "Inter", mono: "Fira Code" },
          fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            "5xl": "3rem",
          },
          fontWeight: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
        },
        animations: {
          style: "smooth",
          duration: { fast: 200, normal: 300, slow: 500 },
          easing: "ease-in-out",
        },
        spacing: { section: "5rem", container: "1.5rem", element: "1rem" },
      },
      createdBy: user.uid,
    });

    if (result.success) {
      alert("Layout created successfully!");
      setEditMode(false);
      setSelectedSections([]);
      loadLayouts();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  function addSection(type: SectionType) {
    setSelectedSections([...selectedSections, type]);
  }

  function removeSection(index: number) {
    setSelectedSections(selectedSections.filter((_, i) => i !== index));
  }

  function moveSectionUp(index: number) {
    if (index === 0) return;
    const newSections = [...selectedSections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSelectedSections(newSections);
  }

  function moveSectionDown(index: number) {
    if (index === selectedSections.length - 1) return;
    const newSections = [...selectedSections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSelectedSections(newSections);
  }

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
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Layout Editor</h1>
              <p className="text-gray-600">Create and manage page layouts</p>
            </div>
            <Button variant="primary" onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancel" : "Create Layout"}
            </Button>
          </div>
        </motion.div>

        {/* Page Selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setSelectedPage(page)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                selectedPage === page
                  ? "bg-nvfc-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Layout Builder */}
        {editMode && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-nvfc-dark mb-4">Build Layout for: {selectedPage}</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Sections */}
                <div>
                  <h3 className="font-semibold mb-3">Available Sections</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSections.map((section) => (
                      <button
                        key={section.type}
                        onClick={() => addSection(section.type)}
                        className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-nvfc-primary hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="text-2xl mb-2">{section.icon}</div>
                        <div className="text-sm font-medium">{section.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Sections */}
                <div>
                  <h3 className="font-semibold mb-3">Layout Preview ({selectedSections.length} sections)</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg min-h-[300px]">
                    {selectedSections.length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        Add sections from the left to build your layout
                      </div>
                    ) : (
                      selectedSections.map((type, index) => {
                        const section = availableSections.find((s) => s.type === type);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                          >
                            <div className="text-2xl">{section?.icon}</div>
                            <div className="flex-1">
                              <div className="font-medium">{section?.name}</div>
                              <div className="text-xs text-gray-500">Order: {index + 1}</div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveSectionUp(index)}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveSectionDown(index)}
                                disabled={index === selectedSections.length - 1}
                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => removeSection(index)}
                                className="p-1 hover:bg-red-100 text-red-600 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {selectedSections.length > 0 && (
                    <Button variant="primary" size="lg" className="w-full mt-4" onClick={handleCreateLayout}>
                      Create Layout
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Existing Layouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout, index) => (
            <motion.div
              key={layout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{layout.name}</h3>
                    <div className="text-xs text-gray-500">v{layout.version}</div>
                  </div>
                  {layout.active && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      Active
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">{layout.sections.length} Sections</div>
                  <div className="flex flex-wrap gap-1">
                    {layout.sections.slice(0, 5).map((section) => {
                      const sectionInfo = availableSections.find((s) => s.type === section.type);
                      return (
                        <span key={section.id} className="text-lg" title={sectionInfo?.name}>
                          {sectionInfo?.icon}
                        </span>
                      );
                    })}
                    {layout.sections.length > 5 && (
                      <span className="text-xs text-gray-500">+{layout.sections.length - 5}</span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Created: {layout.createdAt.toDate().toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  {!layout.active && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleActivateLayout(layout.id)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    Preview
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {layouts.length === 0 && !editMode && (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Layouts Yet</h3>
            <p className="text-gray-600 mb-6">Create your first layout for {selectedPage}</p>
            <Button variant="primary" onClick={() => setEditMode(true)}>
              Create Layout
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
