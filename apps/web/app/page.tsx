import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SearchFilterBar from "../src/components/SearchFilterBar";

export const metadata: Metadata = {
  title: "JeffLink — Uganda's Marketplace",
  description:
    "Find cars, land, and connect with verified dealers across Uganda.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-brand-night px-4 pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Uganda&apos;s <span className="text-brand-accent">Premier</span> Marketplace
        </h1>
        <p className="text-brand-muted text-lg mb-8 max-w-xl mx-auto">
          Buy and sell cars, land, and connect with verified dealers — all in one platform.
        </p>

        {/* ─── Search Filter Bar ─── */}
        <div className="max-w-5xl mx-auto px-2">
          <SearchFilterBar />
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-white mb-8">
          Explore Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            title="Cars"
            description="Sedans, SUVs, trucks and more"
            href="/cars"
            icon="🚗"
          />
          <CategoryCard
            title="Land & Property"
            description="Plots, apartments, and commercial property"
            href="/land"
            icon="🏘️"
          />
          <CategoryCard
            title="Verified Dealers"
            description="Connect with trusted vendors"
            href="/vendors"
            icon="🏪"
          />
        </div>
      </section>
    </main>
  );
}

function CategoryCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-card p-6 flex flex-col gap-3 hover:border-brand-primary/50 transition-colors group"
    >
      <span className="text-4xl">{icon}</span>
      <h3 className="text-white font-semibold text-lg group-hover:text-brand-accent transition-colors">
        {title}
      </h3>
      <p className="text-text-muted text-sm">{description}</p>
    </Link>
  );
}
