import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

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
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1f71",
};

import ConsoleLogger from "@/components/ConsoleLogger";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body className="antialiased">
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <ConsoleLogger />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
