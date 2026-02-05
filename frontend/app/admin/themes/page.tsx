"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getThemes } from "@/lib/layouts";
import type { ThemeConfig } from "@/types/layout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function ThemesPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadThemes();
    }
  }, [isAdmin]);

  async function loadThemes() {
    setLoading(true);
    const allThemes = await getThemes();
    
    // Add default themes if none exist
    const defaultThemes: ThemeConfig[] = [
      {
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
      {
        name: "Navratri Festival",
        colors: {
          primary: "#ff6b35",
          secondary: "#f7931e",
          accent: "#fdc500",
          dark: "#2d1b00",
          light: "#fff8f0",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
          background: "#fffbf5",
          surface: "#fff4e6",
          text: { primary: "#2d1b00", secondary: "#8b5a00", disabled: "#c69c6d" },
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
          style: "energetic",
          duration: { fast: 150, normal: 250, slow: 400 },
          easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        },
        spacing: { section: "4rem", container: "1.5rem", element: "1rem" },
      },
      {
        name: "Championship Gold",
        colors: {
          primary: "#d4af37",
          secondary: "#ffd700",
          accent: "#ffed4e",
          dark: "#1a1a1a",
          light: "#fffef7",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
          background: "#ffffff",
          surface: "#fffef7",
          text: { primary: "#1a1a1a", secondary: "#4a4a4a", disabled: "#9ca3af" },
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
        spacing: { section: "6rem", container: "1.5rem", element: "1rem" },
      },
    ];

    setThemes(allThemes.length > 0 ? allThemes : defaultThemes);
    setLoading(false);
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
              <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Theme Manager</h1>
              <p className="text-gray-600">Customize colors, typography, and animations</p>
            </div>
            <Button variant="primary">Create Theme</Button>
          </div>
        </motion.div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                className={`p-6 cursor-pointer ${
                  selectedTheme?.name === theme.name ? "ring-2 ring-nvfc-primary" : ""
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <h3 className="text-xl font-bold mb-4" style={{ color: theme.colors.primary }}>
                  {theme.name}
                </h3>

                {/* Color Palette */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Colors</div>
                  <div className="flex gap-2">
                    {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Typography</div>
                  <div className="text-xs text-gray-700">
                    Display: {theme.typography.fontFamily.display}
                  </div>
                </div>

                {/* Animation Style */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Animation</div>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                    {theme.animations.style}
                  </span>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Preview Theme
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Theme Details */}
        {selectedTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Theme Details: {selectedTheme.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <div>
                  <h3 className="font-bold mb-4">Color Palette</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedTheme.colors).map(([key, value]) => {
                      if (typeof value === "string") {
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: value }}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium capitalize">{key}</div>
                              <div className="text-xs text-gray-500">{value}</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Typography & Animation */}
                <div>
                  <h3 className="font-bold mb-4">Typography & Animation</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Font Families</div>
                      <div className="text-sm text-gray-600">
                        Display: {selectedTheme.typography.fontFamily.display}
                      </div>
                      <div className="text-sm text-gray-600">
                        Body: {selectedTheme.typography.fontFamily.body}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Animation Style</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {selectedTheme.animations.style}
                      </div>
                      <div className="text-xs text-gray-500">
                        Duration: {selectedTheme.animations.duration.normal}ms
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="primary">Apply to Layout</Button>
                <Button variant="outline">Edit Theme</Button>
                <Button variant="ghost" className="text-red-600">Delete Theme</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
