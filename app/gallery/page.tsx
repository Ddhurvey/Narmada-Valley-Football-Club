"use client";

import React, { useState } from "react";
import Card from "@/components/ui/Card";
import { motion } from "framer-motion";

const mockGalleryItems = [
  { id: "1", title: "Championship Win 2025", year: 2025, event: "championship", image: "🏆" },
  { id: "2", title: "Navratri Celebration", year: 2025, event: "navratri", image: "🎉" },
  { id: "3", title: "Training Session", year: 2026, event: null, image: "⚽" },
  { id: "4", title: "Fan Meet & Greet", year: 2026, event: null, image: "🤝" },
  { id: "5", title: "Stadium Opening", year: 2024, event: "opening", image: "🏟️" },
  { id: "6", title: "Youth Academy", year: 2026, event: null, image: "👦" },
];

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<string | "all">("all");
  const [layout, setLayout] = useState<"grid" | "masonry">("grid");

  const years = ["all", ...Array.from(new Set(mockGalleryItems.map((item) => item.year)))];
  const events = ["all", "championship", "navratri", "opening"];

  const filteredItems = mockGalleryItems.filter((item) => {
    const yearMatch = selectedYear === "all" || item.year === selectedYear;
    const eventMatch = selectedEvent === "all" || item.event === selectedEvent;
    return yearMatch && eventMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-xl">Relive the best moments of NVFC</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
              <div className="flex gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      selectedYear === year
                        ? "bg-nvfc-primary text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {year === "all" ? "All Years" : year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Event</label>
              <div className="flex gap-2">
                {events.map((event) => (
                  <button
                    key={event}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize ${
                      selectedEvent === event
                        ? "bg-nvfc-primary text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {event === "all" ? "All Events" : event}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Layout</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLayout("grid")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    layout === "grid"
                      ? "bg-nvfc-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setLayout("masonry")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    layout === "masonry"
                      ? "bg-nvfc-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Masonry
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          className={
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          }
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={layout === "masonry" ? "break-inside-avoid" : ""}
            >
              <Card hover className="overflow-hidden cursor-pointer">
                <div
                  className={`bg-gradient-to-br from-nvfc-primary to-nvfc-accent flex items-center justify-center text-white ${
                    layout === "grid" ? "aspect-square" : "h-64"
                  }`}
                >
                  <div className="text-8xl">{item.image}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.year}
                    </span>
                    {item.event && (
                      <span className="text-xs bg-nvfc-secondary text-white px-2 py-1 rounded capitalize">
                        {item.event}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🖼️</div>
            <p>No images found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
