"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ThemeConfig, HeroVariant } from "@/types/layout";

interface HeroSectionProps {
  config: {
    variant?: HeroVariant;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  theme: ThemeConfig;
}

export default function HeroSection({ config, theme }: HeroSectionProps) {
  const {
    variant = "default",
    title = "Welcome to NVFC",
    subtitle = "Narmada Valley Football Club",
    ctaText = "Explore",
    ctaLink = "#",
  } = config;

  // Render based on variant
  switch (variant) {
    case "minimal":
      return <MinimalHero title={title} subtitle={subtitle} ctaText={ctaText} ctaLink={ctaLink} theme={theme} />;
    case "split":
      return <SplitHero title={title} subtitle={subtitle} ctaText={ctaText} ctaLink={ctaLink} theme={theme} />;
    default:
      return <DefaultHero title={title} subtitle={subtitle} ctaText={ctaText} ctaLink={ctaLink} theme={theme} />;
  }
}

// Default hero with animations
function DefaultHero({ title, subtitle, ctaText, ctaLink, theme }: any) {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero-pattern text-white overflow-hidden">
      <div className="container-custom text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-bold mb-6"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl md:text-3xl mb-8"
          style={{ color: theme.colors.secondary }}
        >
          {subtitle}
        </motion.p>
        <motion.a
          href={ctaLink}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-block px-8 py-4 bg-nvfc-secondary text-nvfc-dark font-bold rounded-lg hover:scale-105 transition-transform"
        >
          {ctaText}
        </motion.a>
      </div>
    </section>
  );
}

// Minimal hero
function MinimalHero({ title, subtitle, ctaText, ctaLink, theme }: any) {
  return (
    <section className="py-20 bg-white text-center">
      <div className="container-custom">
        <h1 className="text-5xl font-bold mb-4" style={{ color: theme.colors.primary }}>
          {title}
        </h1>
        <p className="text-xl text-gray-600 mb-6">{subtitle}</p>
        <a
          href={ctaLink}
          className="inline-block px-6 py-3 rounded-lg font-semibold"
          style={{ backgroundColor: theme.colors.primary, color: "white" }}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}

// Split hero
function SplitHero({ title, subtitle, ctaText, ctaLink, theme }: any) {
  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-12" style={{ backgroundColor: theme.colors.primary }}>
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl mb-6">{subtitle}</p>
          <a
            href={ctaLink}
            className="inline-block px-6 py-3 rounded-lg font-semibold"
            style={{ backgroundColor: theme.colors.secondary, color: theme.colors.dark }}
          >
            {ctaText}
          </a>
        </div>
      </div>
      <div className="bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white text-6xl">
        ⚽
      </div>
    </section>
  );
}
