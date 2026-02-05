"use client";
import React from "react";
import type { ThemeConfig } from "@/types/layout";

export default function PlayersSection({ config, theme }: { config: any; theme: ThemeConfig }) {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.primary }}>
          Our Squad
        </h2>
        <p className="text-gray-600">Players section - configured via layout editor</p>
      </div>
    </section>
  );
}
