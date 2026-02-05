"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

// Mock news data
const mockNewsArticles: Record<string, any> = {
  "nvfc-signs-star-midfielder": {
    id: "1",
    title: "NVFC Signs Star Midfielder from European League",
    slug: "nvfc-signs-star-midfielder",
    excerpt: "Exciting new addition to strengthen the squad for the upcoming season.",
    content: `
      <p>Narmada Valley Football Club is thrilled to announce the signing of talented midfielder Alex Rodriguez from European League side FC Barcelona B. The 24-year-old has signed a four-year contract with the club.</p>
      
      <p>Rodriguez brings a wealth of experience and technical ability to our midfield. Known for his vision, passing range, and ability to control the tempo of games, he will be a valuable addition to our squad.</p>
      
      <h2>Manager's Comments</h2>
      <p>"We're delighted to welcome Alex to NVFC," said manager John Smith. "He's a player we've been tracking for some time, and we believe he has all the qualities to succeed at this level. His technical ability and football intelligence will be crucial for us this season."</p>
      
      <h2>Player Profile</h2>
      <ul>
        <li>Age: 24</li>
        <li>Position: Central Midfielder</li>
        <li>Previous Club: FC Barcelona B</li>
        <li>Contract Length: 4 years</li>
      </ul>
      
      <p>Rodriguez will wear the number 8 shirt and could make his debut in this weekend's fixture against Rivals FC.</p>
    `,
    image: "/news/signing.jpg",
    date: "2026-02-01",
    category: "Transfers",
    author: "NVFC Media Team",
  },
};

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const article = mockNewsArticles[slug];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/news">
            <Button variant="primary">Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <article className="py-12">
        <div className="container-custom max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/news">
              <Button variant="ghost" size="sm">
                ← Back to News
              </Button>
            </Link>
          </motion.div>

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-nvfc-secondary text-nvfc-dark text-sm font-semibold rounded-full">
                {article.category}
              </span>
              <span className="text-gray-500">{formatDate(article.date)}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-nvfc-dark mb-4">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-600">
              <span>By {article.author}</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="aspect-video bg-gradient-to-br from-nvfc-primary to-nvfc-accent rounded-lg flex items-center justify-center text-white text-6xl">
              📰
            </div>
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </Card>
          </motion.div>

          {/* Share Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex items-center gap-4"
          >
            <span className="font-semibold text-gray-700">Share:</span>
            <div className="flex gap-2">
              {["Facebook", "Twitter", "LinkedIn"].map((platform) => (
                <button
                  key={platform}
                  className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  {platform}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Related Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-nvfc-dark mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} hover className="p-6">
                  <h3 className="text-lg font-bold text-nvfc-dark mb-2">
                    Related Article Title {i}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Brief excerpt of the related article...
                  </p>
                  <Button variant="ghost" size="sm">
                    Read More →
                  </Button>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </article>
    </main>
  );
}

