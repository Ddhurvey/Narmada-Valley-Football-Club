import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nvfc.example.com";
  const routes = [
    "",
    "/news",
    "/fixtures",
    "/players",
    "/records",
    "/tickets",
    "/store",
    "/membership",
    "/gallery",
    "/about",
    "/contact",
    "/live",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
