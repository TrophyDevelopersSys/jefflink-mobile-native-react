import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Post a Listing — Sell on JeffLink",
  description:
    "List your car, land, house, or commercial property on JeffLink — Uganda's marketplace. Reach thousands of verified buyers.",
  openGraph: {
    title: "Sell on JeffLink — Post a Listing Today",
    description:
      "Reach thousands of buyers across Uganda. List cars, land, houses, and commercial property on JeffLink.",
  },
};

const CATEGORIES = [
  { icon: "🚗", label: "Car / Vehicle", description: "Saloons, SUVs, trucks, motorbikes, and more." },
  { icon: "🏘️", label: "Land / Plot", description: "Residential, agricultural, and commercial plots." },
  { icon: "🏠", label: "House", description: "Standalone homes, maisonettes, and apartments." },
  { icon: "🏢", label: "Commercial Property", description: "Offices, warehouses, retail spaces, and industrial units." },
];

export default function SellPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Sell on <span className="text-brand-accent">JeffLink</span>
          </h1>
          <p className="text-text-muted text-lg leading-relaxed mb-8">
            Reach thousands of active buyers across Uganda. Post your listing in
            under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-brand-primary text-white font-semibold px-8 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
            >
              Create Seller Account
            </Link>
            <Link
              href="/login"
              className="bg-surface border border-border text-white font-semibold px-8 py-3 rounded-button hover:border-brand-primary/50 transition-colors"
            >
              Sign In to Post
            </Link>
          </div>
        </div>
      </section>

      {/* What you can list */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          What Can You List?
        </h2>
        <p className="text-text-muted text-center mb-8">
          JeffLink supports four major categories.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className="bg-card border border-border rounded-card p-6 flex gap-4 items-start"
            >
              <span className="text-3xl flex-shrink-0">{cat.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{cat.label}</h3>
                <p className="text-text-muted text-sm mt-1">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How posting works */}
      <section className="bg-surface border-y border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create Account", body: "Sign up as a dealer or private seller. Verification is fast." },
              { step: "2", title: "Post Your Listing", body: "Upload photos, set a price, add a description. Takes under 5 minutes." },
              { step: "3", title: "Get Buyers", body: "Your listing is live immediately. Buyers contact you directly." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 text-brand-accent font-extrabold text-lg flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                <p className="text-text-muted text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JeffLink */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Why Sell on JeffLink?
        </h2>
        <div className="space-y-4">
          {[
            { icon: "👥", title: "Thousands of Active Buyers", body: "Your listing reaches buyers searching daily across Uganda." },
            { icon: "✅", title: "Verified Seller Badge", body: "Build trust with buyers — verified dealers get priority placement." },
            { icon: "📊", title: "Dashboard Analytics", body: "Track views, leads, and listing performance from your dashboard." },
            { icon: "💰", title: "Competitive Pricing", body: "Affordable listing fees with free tier available for private sellers." },
          ].map((v) => (
            <div key={v.title} className="flex gap-4 bg-card border border-border rounded-card p-5">
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
      <section className="pb-16 px-4 text-center">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-card p-8">
          <h2 className="text-xl font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-text-muted text-sm mb-6">
            Join hundreds of verified dealers and private sellers on JeffLink today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-brand-primary text-white font-semibold px-8 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/how-it-works"
              className="bg-brand-slate border border-border text-white text-sm font-medium px-6 py-3 rounded-button hover:border-brand-primary/40 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
