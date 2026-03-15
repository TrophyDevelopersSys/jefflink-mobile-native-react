import type { Metadata } from "next";
import React from "react";
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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JeffLink Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text min-h-screen antialiased flex flex-col">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
