"use client";

import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MediaType = "all" | "images" | "videos";
type FilterType = "all" | "monthly" | "yearly" | "events";
type FilterType = "all" | "monthly" | "yearly" | "events" | "teams";
interface GalleryItem {
  id: string;
  type: "image" | "youtube" | "live";
  url: string;
  thumbnail?: string;
  title: string;
  date: string;
  month: string;
  year: string;
  event?: string;
  description?: string;
  teamSlug?: string;
}

const CACHE_KEY = "nvfc_gallery_cache";
interface TeamItem {
  id: string;
  slug: string;
  label: string;
  order?: number;
}
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

const getYouTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    // ignore
  }
  return null;
};

const getYouTubeThumbnail = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : "";
};

const normalizeGalleryItem = (item: any, id: string): GalleryItem => {
  const createdAt: Date = item.createdAt instanceof Timestamp ? item.createdAt.toDate() : new Date();
  const month = createdAt.toLocaleString("default", { month: "long" });
  const year = String(createdAt.getFullYear());
  const date = createdAt.toISOString().split("T")[0];
  const derivedThumbnail = item.thumbnail || (item.type !== "image" ? getYouTubeThumbnail(item.url || "") : "");
  return {
    id,
    type: item.type || "image",
    url: item.url,
    thumbnail: derivedThumbnail,
    title: item.title || "Gallery Image",
    date,
    month,
    year,
    event: item.event,
    description: item.description,
  };
    teamSlug: item.teamSlug,
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaFilter, setMediaFilter] = useState<MediaType>("all");
  const [timeFilter, setTimeFilter] = useState<FilterType>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { items: GalleryItem[]; cachedAt: number };
        if (Date.now() - parsed.cachedAt < CACHE_TTL_MS) {
          setItems(parsed.items);
          setLoading(false);
        }
      } catch {
        // ignore cache errors
      }
    }

    async function loadGallery() {
      const galleryQuery = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(galleryQuery);
      const rows = snapshot.docs.map((d) => normalizeGalleryItem(d.data(), d.id));
      setItems(rows);
      setLoading(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ items: rows, cachedAt: Date.now() }));
      setCookie("nvfc_gallery_cached_at", String(Date.now()), 7);
    }

    loadGallery();
  }, []);
    async function loadTeams() {
      const teamsQuery = query(collection(db, "teams"), orderBy("order", "asc"));
      const snapshot = await getDocs(teamsQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamItem, "id">),
      }));
      setTeams(rows);
    }

  // Get unique months, years, and events
    loadTeams();
  const months = useMemo(() => ["all", ...Array.from(new Set(items.map((item) => item.month)))], [items]);
  const years = useMemo(() => ["all", ...Array.from(new Set(items.map((item) => item.year)))], [items]);
  const events = useMemo(() => ["all", ...Array.from(new Set(items.map((item) => item.event).filter(Boolean)))], [items]);

  const filteredItems = items.filter((item) => {
    // Media type filter
  const teamOptions = useMemo(
    () => ["all", ...teams.map((team) => team.slug)],
    [teams]
  );
    if (mediaFilter === "images" && item.type !== "image") return false;
    if (mediaFilter === "videos" && item.type === "image") return false;

    // Time-based filters
    if (timeFilter === "monthly" && selectedMonth !== "all" && item.month !== selectedMonth) return false;
    if (timeFilter === "yearly" && selectedYear !== "all" && item.year !== selectedYear) return false;
    if (timeFilter === "events" && selectedEvent !== "all" && item.event !== selectedEvent) return false;

    return true;
  });
    if (timeFilter === "teams" && selectedTeam !== "all" && item.teamSlug !== selectedTeam) return false;

  const MediaCard = ({ item }: { item: GalleryItem }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      onClick={() => setSelectedItem(item)}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden h-full">
        <div className="relative aspect-video bg-gray-200">
          {item.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.thumbnail || "/logo.png"} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                {item.type === "live" ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                      🔴 LIVE
                    </div>
                    <div className="bg-white/90 rounded-full p-4">
                      <svg className="w-12 h-12 text-nvfc-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-full p-4">
                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>📅 {item.date}</span>
            {item.event && <span className="px-2 py-1 bg-nvfc-secondary/20 text-nvfc-primary rounded text-xs font-semibold">{item.event}</span>}
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-hero-pattern text-white py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Media Gallery</h1>
            <p className="text-xl text-gray-200">
              Photos, videos, and live matches from NVFC
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-12">
        {loading && <div className="text-center text-gray-500 mb-6">Loading gallery...</div>}

        {/* Media Type Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            {[
              { label: "All Media", value: "all" },
              { label: "📸 Images", value: "images" },
              { label: "🎥 Videos", value: "videos" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setMediaFilter(tab.value as MediaType)}
                className={`px-6 py-3 font-semibold transition-all ${
                  mediaFilter === tab.value
                    ? "border-b-2 border-nvfc-primary text-nvfc-primary"
                    : "text-gray-600 hover:text-nvfc-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time-based Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              {[
                { label: "All Time", value: "all" },
                { label: "By Month", value: "monthly" },
                { label: "By Year", value: "yearly" },
                { label: "By Event", value: "events" },
              ].map((filter) => (
                <Button
                  key={filter.value}
                { label: "By Team", value: "teams" },
                  variant={timeFilter === filter.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(filter.value as FilterType)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Conditional Dropdowns */}
            {timeFilter === "monthly" && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvfc-primary"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month === "all" ? "All Months" : month}
                  </option>
                ))}
              </select>
            )}

            {timeFilter === "yearly" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvfc-primary"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year === "all" ? "All Years" : year}
                  </option>
                ))}
              </select>
            )}

            {timeFilter === "events" && (
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvfc-primary"
              >
                {events.map((event) => (
                  <option key={event} value={event}>
                    {event === "all" ? "All Events" : event}
                  </option>
                ))}
              </select>
            )}
          </div>
        </motion.div>

            {timeFilter === "teams" && (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvfc-primary"
              >
                {teamOptions.map((team) => (
                  <option key={team} value={team}>
                    {team === "all" ? "All Teams" : teams.find((t) => t.slug === team)?.label || team}
                  </option>
                ))}
              </select>
            )}
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No media found for the selected filters</p>
          </div>
        )}
      </div>

      {/* Modal for viewing media */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                  <p className="text-gray-600">{selectedItem.date} • {selectedItem.event}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                  ×
                </button>
              </div>

              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                {selectedItem.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-full object-contain" />
                ) : (
                  <iframe
                    src={selectedItem.url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {selectedItem.description && (
                <p className="text-gray-700">{selectedItem.description}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
