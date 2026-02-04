"use client";
import React from "react";
import type { ThemeConfig } from "@/types/layout";

export default function CTASection({ config, theme }: { config: any; theme: ThemeConfig }) {
  return <section className="section-padding bg-gradient-to-r from-nvfc-primary to-nvfc-accent text-white"><div className="container-custom text-center"><h2 className="text-4xl font-bold mb-4">{config.title || "Join NVFC Today"}</h2><button className="px-8 py-4 bg-white text-nvfc-primary font-bold rounded-lg">{config.ctaText || "Get Started"}</button></div></section>;
}
