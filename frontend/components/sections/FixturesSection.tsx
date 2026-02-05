"use client";

import React from "react";
import type { ThemeConfig } from "@/types/layout";

// Placeholder components for remaining sections
export default function FixturesSection({ config, theme }: { config: any; theme: ThemeConfig }) {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.primary }}>
          Upcoming Fixtures
        </h2>
        <p className="text-gray-600">Fixtures section - configured via layout editor</p>
      </div>
    </section>
  );
}
