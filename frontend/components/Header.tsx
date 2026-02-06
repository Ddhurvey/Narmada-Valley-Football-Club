"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Button from "./ui/Button";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LiveScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  isLive: boolean;
}

interface AnnouncementConfig {
  enabled: boolean;
  message: string;
  style: "static" | "scroll";
  bgColor: string;
  textColor: string;
  speedSec: number;
  startAt?: string;
  endAt?: string;
}

interface NavLinkItem {
  href: string;
  label: string;
  children?: NavLinkItem[];
}

interface TeamItem {
  id: string;
  slug: string;
  label: string;
  order?: number;
}

const defaultNavLinks: NavLinkItem[] = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/records", label: "Records" },
  {
    href: "/players",
    label: "Squad",
    children: [
      { href: "/players?team=boys", label: "Boys Team" },
      { href: "/players?team=boys-u15", label: "Boys U15" },
      { href: "/players?team=boys-u18", label: "Boys U18" },
      { href: "/players?team=boys-u19", label: "Boys U19" },
      { href: "/players?team=girls", label: "Girls Team" },
      { href: "/players?team=girls-u15", label: "Girls U15" },
      { href: "/players?team=girls-u18", label: "Girls U18" },
      { href: "/players?team=girls-u19", label: "Girls U19" },
    ],
  },
  { href: "/tickets", label: "Tickets" },
  { href: "/store", label: "Store" },
  { href: "/about", label: "Club" },
];

const Header: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementConfig | null>(null);
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(defaultNavLinks);
  const [teams, setTeams] = useState<TeamItem[]>([]);

  // Mock live score - will be replaced with Socket.IO
  useEffect(() => {
    setLiveScore({
      homeTeam: "NVFC",
      awayTeam: "Rivals FC",
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      isLive: true,
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "announcements", "global"), (snap) => {
      if (snap.exists()) {
        setAnnouncement(snap.data() as AnnouncementConfig);
      } else {
        setAnnouncement(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "navigation"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { links?: NavLinkItem[] };
        if (Array.isArray(data.links) && data.links.length > 0) {
          setNavLinks(data.links);
          return;
        }
      }
      setNavLinks(defaultNavLinks);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const teamsQuery = query(collection(db, "teams"), orderBy("order", "asc"));
    const unsub = onSnapshot(teamsQuery, (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TeamItem, "id">),
      }));
      setTeams(rows);
    });
    return () => unsub();
  }, []);

  const teamLinks: NavLinkItem[] = (teams.length
    ? teams.map((team) => ({
        href: `/players?team=${team.slug}`,
        label: team.label,
      }))
    : (defaultNavLinks.find((link) => link.href === "/players")?.children || [])
  );

  const resolvedNavLinks = navLinks.map((link) =>
    link.href === "/players"
      ? {
          ...link,
          children: teamLinks,
        }
      : link
  );

  const shouldShowAnnouncement = (() => {
    if (!announcement?.enabled || !announcement?.message) return false;
    const now = new Date();
    if (announcement.startAt) {
      const start = new Date(announcement.startAt);
      if (now < start) return false;
    }
    if (announcement.endAt) {
      const end = new Date(announcement.endAt);
      if (now > end) return false;
    }
    return true;
  })();

  return (
    <>
      {/* Announcement / Live Score */}
      {shouldShowAnnouncement ? (
        <div
          className="py-2 overflow-hidden"
          style={{ backgroundColor: announcement?.bgColor || "#e63946", color: announcement?.textColor || "#ffffff" }}
        >
          <div className="container-custom">
            {announcement?.style === "scroll" ? (
              <div
                className="announcement-marquee text-sm font-semibold"
                style={{ animationDuration: `${Math.max(5, announcement?.speedSec || 20)}s` }}
              >
                {announcement.message}
              </div>
            ) : (
              <div className="text-sm font-semibold text-center">{announcement?.message}</div>
            )}
          </div>
        </div>
      ) : (
        liveScore &&
        liveScore.isLive && (
          <div className="bg-nvfc-accent text-white py-2 overflow-hidden">
            <div className="container-custom">
              <div className="flex items-center justify-center gap-4 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
                <span>
                  {liveScore.homeTeam} {liveScore.homeScore} - {liveScore.awayScore} {liveScore.awayTeam}
                </span>
                <span className="text-xs opacity-90">{liveScore.minute}&apos;</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
        )}
      >
        <nav className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-14 h-14 relative group-hover:scale-110 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="NVFC Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-nvfc-dark">NVFC</h1>
                <p className="text-xs text-gray-600">Narmada Valley FC</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {resolvedNavLinks.map((link) =>
                link.children ? (
                  <div key={link.href} className="relative group">
                    <Link
                      href={link.href}
                      className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors relative"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-nvfc-primary group-hover:w-full transition-all duration-300" />
                    </Link>
                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block">
                      <div className="bg-white shadow-lg rounded-lg border border-gray-100 py-2 min-w-[180px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-nvfc-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                )
              )}
            </div>

            {/* User Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      My NVFC
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="secondary" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary" size="sm">
                      Join Now
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-nvfc-dark hover:text-nvfc-primary transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex flex-col gap-4">
                  {resolvedNavLinks.map((link) =>
                    link.children ? (
                      <div key={link.href} className="flex flex-col gap-2">
                        <Link
                          href={link.href}
                          className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors py-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                        <div className="ml-3 flex flex-col gap-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="text-gray-600 hover:text-nvfc-primary text-sm transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                    {user ? (
                      <>
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full">
                            My NVFC
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="secondary" size="sm" className="w-full">
                              Admin
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" size="sm" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="primary" size="sm" className="w-full">
                            Join Now
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>
  );
};

// Import cn function at top
import { cn } from "@/lib/utils";

export default Header;
