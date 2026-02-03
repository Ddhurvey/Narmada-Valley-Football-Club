"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    club: [
      { label: "About NVFC", href: "/about" },
      { label: "History", href: "/about#history" },
      { label: "Stadium", href: "/stadium" },
      { label: "Contact", href: "/contact" },
    ],
    fans: [
      { label: "News", href: "/news" },
      { label: "Fixtures", href: "/fixtures" },
      { label: "Tickets", href: "/tickets" },
      { label: "Membership", href: "/membership" },
    ],
    commercial: [
      { label: "Store", href: "/store" },
      { label: "Sponsors", href: "/sponsors" },
      { label: "Partners", href: "/partners" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: "facebook", href: "#" },
    { name: "Twitter", icon: "twitter", href: "#" },
    { name: "Instagram", icon: "instagram", href: "#" },
    { name: "YouTube", icon: "youtube", href: "#" },
  ];

  return (
    <footer className="bg-nvfc-dark text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-nvfc-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-nvfc-secondary">N</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">NVFC</h3>
                <p className="text-sm text-gray-400">Narmada Valley FC</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Official website of Narmada Valley Football Club. Follow us for the latest news, fixtures, and updates.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-nvfc-primary hover:bg-nvfc-accent rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <span className="text-sm">📱</span>
                </a>
              ))}
            </div>
          </div>

          {/* Club Links */}
          <div>
            <h4 className="font-bold mb-4">Club</h4>
            <ul className="space-y-2">
              {footerLinks.club.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-nvfc-secondary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fans Links */}
          <div>
            <h4 className="font-bold mb-4">Fans</h4>
            <ul className="space-y-2">
              {footerLinks.fans.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-nvfc-secondary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Commercial Links */}
          <div>
            <h4 className="font-bold mb-4">Commercial</h4>
            <ul className="space-y-2">
              {footerLinks.commercial.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-nvfc-secondary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Narmada Valley Football Club. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-nvfc-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-nvfc-secondary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-nvfc-secondary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
