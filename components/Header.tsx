"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Button from "./ui/Button";

interface LiveScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  isLive: boolean;
}

const Header: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);

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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/news", label: "News" },
    { href: "/fixtures", label: "Fixtures" },
    { href: "/players", label: "Squad" },
    { href: "/tickets", label: "Tickets" },
    { href: "/store", label: "Store" },
    { href: "/about", label: "Club" },
  ];

  return (
    <>
      {/* Live Score Ticker */}
      {liveScore && liveScore.isLive && (
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
              <span className="text-xs opacity-90">{liveScore.minute}'</span>
            </div>
          </div>
        </div>
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
              <div className="w-12 h-12 bg-nvfc-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-nvfc-secondary">N</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-nvfc-dark">NVFC</h1>
                <p className="text-xs text-gray-600">Narmada Valley FC</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-nvfc-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-nvfc-dark hover:text-nvfc-primary font-medium transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
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
