import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NVFC - Narmada Valley Football Club",
  description: "Official website of Narmada Valley Football Club. Latest news, fixtures, players, tickets, and merchandise.",
  keywords: "NVFC, Narmada Valley, Football Club, Soccer, Tickets, Merchandise, Live Scores",
  authors: [{ name: "NVFC" }],
  openGraph: {
    title: "NVFC - Narmada Valley Football Club",
    description: "Official website of Narmada Valley Football Club",
    type: "website",
    locale: "en_IN",
    siteName: "NVFC",
  },
  twitter: {
    card: "summary_large_image",
    title: "NVFC - Narmada Valley Football Club",
    description: "Official website of Narmada Valley Football Club",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
};

export default metadata;
