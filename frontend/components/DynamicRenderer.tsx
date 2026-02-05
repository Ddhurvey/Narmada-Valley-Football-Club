"use client";

import React, { useEffect, useState } from "react";
import { getActiveLayout, applyTheme } from "@/lib/layouts";
import type { LayoutConfig, SectionConfig } from "@/types/layout";

// Import section components
import HeroSection from "./sections/HeroSection";
import NewsSection from "./sections/NewsSection";
import FixturesSection from "./sections/FixturesSection";
import PlayersSection from "./sections/PlayersSection";
import GallerySection from "./sections/GallerySection";
import SponsorsSection from "./sections/SponsorsSection";
import StatsSection from "./sections/StatsSection";
import CountdownSection from "./sections/CountdownSection";
import CTASection from "./sections/CTASection";

interface DynamicRendererProps {
  page: string;
  fallback?: React.ReactNode;
}

/**
 * DynamicRenderer - Renders page layout based on Firestore configuration
 * Automatically switches layouts based on events, dates, and admin settings
 */
export default function DynamicRenderer({ page, fallback }: DynamicRendererProps) {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLayout() {
      try {
        setLoading(true);
        const activeLayout = await getActiveLayout(page);
        
        if (activeLayout) {
          setLayout(activeLayout);
          // Apply theme
          applyTheme(activeLayout.theme);
        } else {
          setError("No active layout found");
        }
      } catch (err: any) {
        console.error("Error loading layout:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLayout();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvfc-primary"></div>
      </div>
    );
  }

  if (error || !layout) {
    // Render fallback if provided, otherwise show error
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-nvfc-dark mb-2">Layout Not Available</h2>
          <p className="text-gray-600">Using default layout...</p>
        </div>
      </div>
    );
  }

  // Sort sections by order
  const sortedSections = [...layout.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="dynamic-layout" data-layout-id={layout.id} data-layout-version={layout.version}>
      {sortedSections.map((section) => {
        if (!section.visible) return null;
        
        return (
          <div key={section.id} className="section-wrapper">
            {renderSection(section, layout.theme)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render individual section based on type
 */
function renderSection(section: SectionConfig, theme: any) {
  const commonProps = {
    config: section.config,
    theme,
  };

  switch (section.type) {
    case "hero":
      return <HeroSection {...commonProps} />;
    case "news":
      return <NewsSection {...commonProps} />;
    case "fixtures":
      return <FixturesSection {...commonProps} />;
    case "players":
      return <PlayersSection {...commonProps} />;
    case "gallery":
      return <GallerySection {...commonProps} />;
    case "sponsors":
      return <SponsorsSection {...commonProps} />;
    case "stats":
      return <StatsSection {...commonProps} />;
    case "countdown":
      return <CountdownSection {...commonProps} />;
    case "cta":
      return <CTASection {...commonProps} />;
    default:
      console.warn(`Unknown section type: ${section.type}`);
      return null;
  }
}
