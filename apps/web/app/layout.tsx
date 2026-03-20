import type { Metadata } from "next";
import React from "react";
import { brand, fonts } from "@jefflink/design-tokens";
import "../src/globals.css";
import { Providers } from "../src/components/Providers";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://jefflinkcars.com"),
  title: {
    default: "JeffLink — Uganda's Marketplace",
    template: "%s | JeffLink",
  },
  description:
    "Buy and sell cars, land, and connect with verified dealers on JeffLink — Uganda's leading marketplace platform.",
  keywords: ["cars Uganda", "land for sale Uganda", "marketplace Uganda", "buy car Kampala"],
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://jefflink.com",
    siteName: "JeffLink",
    images: [
      {
        url: brand.assets.logo.primary,
        width: 1200,
        height: 630,
        alt: "JeffLink Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [brand.assets.logo.primary],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontFaceCss = [
    {
      family: fonts.family.light,
      weight: 300,
      source: fonts.source.light,
    },
    {
      family: fonts.family.regular,
      weight: 400,
      source: fonts.source.regular,
    },
    {
      family: fonts.family.bold,
      weight: 700,
      source: fonts.source.bold,
    },
  ]
    .map(
      (font) => `
        @font-face {
          font-family: '${font.family}';
          src: url('${font.source.woff2}') format('woff2'),
               url('${font.source.woff}') format('woff');
          font-style: normal;
          font-weight: ${font.weight};
          font-display: swap;
        }
      `,
    )
    .join('');

  return (
    <html lang="en" className="dark">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { --font-sans: ${fonts.stack.sans}; }
              ${fontFaceCss}
            `,
          }}
        />
      </head>
      <body className="bg-background text-text min-h-screen antialiased flex flex-col font-sans">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
