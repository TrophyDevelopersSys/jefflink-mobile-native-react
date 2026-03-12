/** @type {import('next').NextConfig} */
const nextConfig = {
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
