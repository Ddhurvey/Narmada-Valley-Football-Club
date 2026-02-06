import { NextResponse } from "next/server";

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://narmada-valley-football-club.vercel.app";
  const urls = [
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

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((route) => `  <url><loc>${baseUrl}${route}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
