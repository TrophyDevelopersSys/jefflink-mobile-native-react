import type { MetadataRoute } from "next";

const BASE_URL = process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://jefflink.ug";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cars", "/land", "/houses", "/commercial", "/vendors", "/search", "/about", "/how-it-works", "/contact", "/sell", "/login", "/register"],
        disallow: ["/dashboard", "/dashboard/", "/api/", "/_next/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
