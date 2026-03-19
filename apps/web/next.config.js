/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/v1/* to the backend so browser requests are same-origin (no CORS).
  // BACKEND_URL must point to the NestJS API service, never the web service itself.
  async rewrites() {
    const backend =
      process.env["BACKEND_URL"] ?? "https://api.jefflinkcars.com";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backend}/api/v1/:path*`,
      },
    ];
  },

  // Expose a server-only env var so server components use the absolute URL
  // directly (Node.js fetch requires absolute URLs; relative paths break SSR).
  env: {
    INTERNAL_API_URL:
      process.env["INTERNAL_API_URL"] ??
      (process.env["BACKEND_URL"] ? `${process.env["BACKEND_URL"]}/api/v1` : undefined) ??
      "https://api.jefflinkcars.com/api/v1",
  },

  transpilePackages: [
    "@jefflink/ui",
    "@jefflink/api",
    "@jefflink/auth",
    "@jefflink/design-tokens",
    "@jefflink/types",
    "@jefflink/utils",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    // Allow TypeScript path imports from workspace packages
    externalDir: true,
  },
};

module.exports = nextConfig;
