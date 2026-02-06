import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

const links = [
  { href: "/", label: "Home" },
  { href: "/news", label: "News" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/players", label: "Squad" },
  { href: "/records", label: "Records" },
  { href: "/tickets", label: "Tickets" },
  { href: "/store", label: "Store" },
  { href: "/membership", label: "Membership" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Club" },
  { href: "/contact", label: "Contact" },
  { href: "/live", label: "Live" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/accessibility", label: "Accessibility" },
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-nvfc-dark mb-2">Sitemap</h1>
          <p className="text-gray-600">Quick links to all public pages.</p>
        </motion.div>

        <Card className="p-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-nvfc-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
