import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Narmada Valley Football Club | Official Website",
  description: "Official website of Narmada Valley Football Club - News, fixtures, tickets, and more",
  keywords: ["NVFC", "Narmada Valley FC", "Football", "Soccer", "Sports"],
  authors: [{ name: "NVFC" }],
  openGraph: {
    title: "Narmada Valley Football Club",
    description: "Official website of Narmada Valley Football Club",
    type: "website",
    locale: "en_US",
    siteName: "NVFC",
  },
  twitter: {
    card: "summary_large_image",
    title: "Narmada Valley Football Club",
    description: "Official website of Narmada Valley Football Club",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1a1f71",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

import ConsoleLogger from "@/components/ConsoleLogger";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConsoleLogger />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
