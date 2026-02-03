"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

// Mock news data - will be replaced with Firestore
const mockNews = [
  {
    id: "1",
    title: "NVFC Signs Star Midfielder from European League",
    slug: "nvfc-signs-star-midfielder",
    excerpt: "Exciting new addition to strengthen the squad for the upcoming season. The club announces a major signing that will boost our midfield capabilities.",
    content: "Full article content here...",
    image: "/news/signing.jpg",
    date: "2026-02-01",
    category: "Transfers",
    author: "NVFC Media Team",
  },
  {
    id: "2",
    title: "Match Preview: NVFC vs Rivals FC - Derby Day",
    slug: "match-preview-nvfc-vs-rivals",
    excerpt: "Everything you need to know about this weekend's crucial derby fixture. Team news, stats, and predictions for the big game.",
    content: "Full article content here...",
    image: "/news/preview.jpg",
    date: "2026-02-02",
    category: "Match Preview",
    author: "John Smith",
  },
  {
    id: "3",
    title: "Youth Academy Success: Three Players Promoted",
    slug: "youth-academy-success",
    excerpt: "Three academy players called up to first team training. A testament to our excellent youth development program.",
    content: "Full article content here...",
    image: "/news/youth.jpg",
    date: "2026-02-03",
    category: "Academy",
    author: "Sarah Johnson",
  },
  {
    id: "4",
    title: "NVFC Foundation Launches Community Initiative",
    slug: "community-initiative-launch",
    excerpt: "New program aims to support local youth football development and provide opportunities for underprivileged children.",
    content: "Full article content here...",
    image: "/news/community.jpg",
    date: "2026-01-30",
    category: "Community",
    author: "NVFC Foundation",
  },
  {
    id: "5",
    title: "Captain's Interview: Looking Ahead to Crucial Month",
    slug: "captain-interview-february",
    excerpt: "Our captain discusses the team's form, upcoming fixtures, and ambitions for the rest of the season.",
    content: "Full article content here...",
    image: "/news/captain.jpg",
    date: "2026-01-28",
    category: "Interviews",
    author: "Media Team",
  },
  {
    id: "6",
    title: "New Kit Launch: 2026 Home Jersey Revealed",
    slug: "new-kit-launch-2026",
    excerpt: "Check out our stunning new home kit for the 2026 season. Available now in the official store.",
    content: "Full article content here...",
    image: "/news/kit.jpg",
    date: "2026-01-25",
    category: "Commercial",
    author: "NVFC Store",
  },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredNews, setFilteredNews] = useState(mockNews);

  const categories = ["All", "Transfers", "Match Preview", "Academy", "Community", "Interviews", "Commercial"];

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredNews(mockNews);
    } else {
      setFilteredNews(mockNews.filter((news) => news.category === selectedCategory));
    }
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest News</h1>
            <p className="text-xl text-gray-200">
              Stay updated with the latest from Narmada Valley Football Club
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-nvfc-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={`/news/${news.slug}`}>
                <Card hover className="h-full overflow-hidden">
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white text-5xl">
                    📰
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-nvfc-secondary text-nvfc-dark text-xs font-semibold rounded-full">
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(news.date)}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-nvfc-dark line-clamp-2">
                      {news.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{news.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">By {news.author}</span>
                      <Button variant="ghost" size="sm">
                        Read More →
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="ghost" size="lg">
            Load More Articles
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
