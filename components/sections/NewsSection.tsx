"use client";

import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import type { ThemeConfig, NewsVariant } from "@/types/layout";

interface NewsSectionProps {
  config: {
    variant?: NewsVariant;
    title?: string;
    limit?: number;
  };
  theme: ThemeConfig;
}

// Mock news data
const mockNews = [
  { id: "1", title: "NVFC Signs Star Midfielder", excerpt: "Exciting new addition to the squad", category: "Transfers" },
  { id: "2", title: "Match Preview: Derby Day", excerpt: "Everything you need to know", category: "Preview" },
  { id: "3", title: "Youth Academy Success", excerpt: "Three players promoted to first team", category: "Academy" },
];

export default function NewsSection({ config, theme }: NewsSectionProps) {
  const { variant = "grid", title = "Latest News", limit = 3 } = config;

  const news = mockNews.slice(0, limit);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-8"
          style={{ color: theme.colors.primary }}
        >
          {title}
        </motion.h2>

        {variant === "grid" && <GridLayout news={news} theme={theme} />}
        {variant === "featured" && <FeaturedLayout news={news} theme={theme} />}
      </div>
    </section>
  );
}

function GridLayout({ news, theme }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {news.map((item: any, index: number) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={`/news/${item.id}`}>
            <Card hover className="p-6 h-full">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ backgroundColor: theme.colors.secondary, color: theme.colors.dark }}
              >
                {item.category}
              </span>
              <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.dark }}>
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4">{item.excerpt}</p>
              <Button variant="ghost" size="sm">
                Read More →
              </Button>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function FeaturedLayout({ news, theme }: any) {
  const [featured, ...rest] = news;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Featured article */}
      <Link href={`/news/${featured.id}`}>
        <Card hover className="p-8 h-full">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ backgroundColor: theme.colors.accent, color: "white" }}
          >
            Featured
          </span>
          <h3 className="text-3xl font-bold mb-4" style={{ color: theme.colors.primary }}>
            {featured.title}
          </h3>
          <p className="text-gray-600 text-lg mb-6">{featured.excerpt}</p>
          <Button variant="primary">Read Full Story</Button>
        </Card>
      </Link>

      {/* Other articles */}
      <div className="space-y-4">
        {rest.map((item: any) => (
          <Link key={item.id} href={`/news/${item.id}`}>
            <Card hover className="p-4">
              <h4 className="font-bold mb-2" style={{ color: theme.colors.dark }}>
                {item.title}
              </h4>
              <p className="text-sm text-gray-600">{item.excerpt}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
