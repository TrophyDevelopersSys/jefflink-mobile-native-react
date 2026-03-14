import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About JeffLink",
  description:
    "JeffLink is Uganda's leading hire-purchase and marketplace platform for vehicles, land, houses, and commercial properties.",
  openGraph: {
    title: "About JeffLink — Uganda's Marketplace",
    description:
      "Learn how JeffLink connects buyers, sellers, and verified dealers across Uganda.",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            About <span className="text-brand-accent">JeffLink</span>
          </h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Uganda&apos;s leading hire-purchase and marketplace platform for
            vehicles, properties, and financial products.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
        <p className="text-text-muted leading-relaxed mb-6">
          JeffLink was built to close the gap between buyers and verified
          sellers in Uganda. Whether you are looking for a reliable second-hand
          car in Kampala, a plot of land in Wakiso, or a commercial space in
          Jinja — JeffLink connects you directly with trusted dealers, agents,
          and private sellers.
        </p>
        <p className="text-text-muted leading-relaxed">
          We believe every Ugandan deserves transparent, accessible, and
          affordable access to assets that build wealth — from land ownership to
          vehicle finance.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-surface border-y border-border py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "1,000+", label: "Active Listings" },
            { value: "200+", label: "Verified Vendors" },
            { value: "50+", label: "Districts Covered" },
            { value: "24/7", label: "Platform Access" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-brand-accent">{stat.value}</p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">What We Stand For</h2>
        <div className="space-y-4">
          {[
            {
              icon: "✅",
              title: "Verified Listings",
              body: "Every dealer and agent on JeffLink goes through a verification process to protect buyers.",
            },
            {
              icon: "💬",
              title: "Direct Contact",
              body: "Reach sellers instantly — no middlemen, no hidden fees.",
            },
            {
              icon: "🛡️",
              title: "Transparency",
              body: "Clear pricing, honest descriptions, and real photos on every listing.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="flex gap-4 bg-card border border-border rounded-card p-5"
            >
              <span className="text-2xl flex-shrink-0">{v.icon}</span>
              <div>
                <h3 className="text-white font-semibold mb-1">{v.title}</h3>
                <p className="text-text-muted text-sm">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          Ready to explore the marketplace?
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cars"
            className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
          >
            Browse Cars
          </Link>
          <Link
            href="/land"
            className="bg-surface border border-border text-white font-semibold px-6 py-3 rounded-button hover:border-brand-primary/50 transition-colors"
          >
            Browse Land
          </Link>
          <Link
            href="/vendors"
            className="bg-surface border border-border text-white font-semibold px-6 py-3 rounded-button hover:border-brand-primary/50 transition-colors"
          >
            Find Vendors
          </Link>
        </div>
      </section>
    </main>
  );
}
