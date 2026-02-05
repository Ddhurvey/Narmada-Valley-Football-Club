"use client";

import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { NewsArticle, getAllNews } from "@/lib/news";

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Transfers", "Match Preview", "Academy", "Community", "Interviews", "Commercial"];

  useEffect(() => {
    async function fetchNews() {
        const data = await getAllNews();
        // Only show published articles for public
        const published = data.filter(item => item.isPublished);
        setNews(published);
        setFilteredNews(published);
        setLoading(false);
    }
    fetchNews();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter((item) => item.category === selectedCategory));
    }
  }, [selectedCategory, news]);

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
                  <div className="aspect-video bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white text-5xl overflow-hidden relative">
                    {news.image ? (
                        <img 
                            src={news.image} 
                            alt={news.title} 
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <span>📰</span>
                    )}
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
