"use client";
import React from "react";
import type { ThemeConfig } from "@/types/layout";

export default function StatsSection({ config, theme }: { config: any; theme: ThemeConfig }) {
  return <section className="section-padding"><div className="container-custom"><h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.primary }}>Stats</h2></div></section>;
}
