"use client";
import React, { useEffect, useState } from "react";
import type { ThemeConfig } from "@/types/layout";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  createdAt?: Timestamp;
}

const CACHE_KEY = "nvfc_gallery_cache";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export default function GallerySection({ config, theme }: { config: any; theme: ThemeConfig }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

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
        // ignore
      }
    }

    async function loadGallery() {
      const galleryQuery = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(galleryQuery);
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<GalleryItem, "id">),
      }));
      setItems(rows.slice(0, 6));
      setLoading(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ items: rows, cachedAt: Date.now() }));
    }

    loadGallery();
  }, []);

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
            Gallery
          </h2>
          <Link href="/gallery" className="text-sm text-nvfc-primary hover:underline">
            View all
          </Link>
        </div>

        {loading && <div className="text-gray-600">Loading gallery...</div>}
        {!loading && items.length === 0 && <div className="text-gray-600">No images found.</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
