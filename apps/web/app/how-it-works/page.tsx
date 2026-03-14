import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how to buy, sell, and connect with verified vendors on JeffLink — Uganda's marketplace for cars, land, and property.",
  openGraph: {
    title: "How JeffLink Works — Buy & Sell in Uganda",
    description:
      "Step-by-step guide to buying or selling cars, land, and property on JeffLink.",
  },
};

const BUYER_STEPS = [
  {
    step: "1",
    title: "Search the Marketplace",
    body: "Browse thousands of listings for cars, land, houses, and commercial properties across Uganda.",
  },
  {
    step: "2",
    title: "Find What You Need",
    body: "Use filters to narrow by price, location, type, and condition. Every listing shows real photos and prices.",
  },
  {
    step: "3",
    title: "Contact the Seller Directly",
    body: "Reach the verified dealer or private seller instantly — call, WhatsApp, or message through the platform.",
  },
  {
    step: "4",
    title: "Close the Deal",
    body: "Arrange a viewing, negotiate, and complete your purchase securely with the seller.",
  },
];

const SELLER_STEPS = [
  {
    step: "1",
    title: "Create Your Account",
    body: "Sign up as a dealer or private seller. Dealers go through a quick verification process.",
  },
  {
    step: "2",
    title: "Post a Listing",
    body: "Add photos, set your price, describe your item, and choose a category — it takes under 5 minutes.",
  },
  {
    step: "3",
    title: "Get Found by Buyers",
    body: "Your listing appears instantly in search results and category pages across JeffLink.",
  },
  {
    step: "4",
    title: "Connect & Sell",
    body: "Buyers contact you directly. Manage leads and track performance from your dashboard.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      {/* Hero */}
      <section className="bg-surface border-b border-border py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">How It Works</h1>
          <p className="text-text-muted text-lg">
            JeffLink makes it simple to buy and sell cars, land, and property in
            Uganda — for everyone.
          </p>
        </div>
      </section>

      {/* Buyer flow */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🛒</span>
          <h2 className="text-2xl font-bold text-white">For Buyers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BUYER_STEPS.map((s) => (
            <div
              key={s.step}
              className="bg-card border border-border rounded-card p-6 flex gap-4"
            >
              <span className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-accent font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                {s.step}
              </span>
              <div>
                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                <p className="text-text-muted text-sm">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link
            href="/search"
            className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
          >
            Start Browsing
          </Link>
          <Link
            href="/cars"
            className="bg-surface border border-border text-white font-semibold px-6 py-3 rounded-button hover:border-brand-primary/50 transition-colors"
          >
            Browse Cars
          </Link>
        </div>
      </section>

      <hr className="border-border max-w-4xl mx-auto" />

      {/* Seller flow */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="flex items-center gap-3 mb-8">
          <Store size={32} strokeWidth={1.5} className="text-brand-accent" />
          <h2 className="text-2xl font-bold text-white">For Sellers & Dealers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SELLER_STEPS.map((s) => (
            <div
              key={s.step}
              className="bg-card border border-border rounded-card p-6 flex gap-4"
            >
              <span className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-accent font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                {s.step}
              </span>
              <div>
                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                <p className="text-text-muted text-sm">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link
            href="/register"
            className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/sell"
            className="bg-surface border border-border text-white font-semibold px-6 py-3 rounded-button hover:border-brand-primary/50 transition-colors"
          >
            Post a Listing
          </Link>
        </div>
      </section>

      {/* FAQ / quick answers */}
      <section className="bg-surface border-t border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is JeffLink free to use?",
                a: "Browsing and searching listings is completely free. Sellers pay a small fee to post featured listings.",
              },
              {
                q: "How are vendors verified?",
                a: "Vendors submit business documents and go through a manual review by the JeffLink team before receiving a verification badge.",
              },
              {
                q: "Can I post listings as an individual?",
                a: "Yes. Register a standard account and you can post private listings for vehicles or property.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-card border border-border rounded-card p-5"
              >
                <h3 className="text-white font-semibold mb-1">{faq.q}</h3>
                <p className="text-text-muted text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
          <p className="text-text-muted text-sm mt-6">
            Have more questions?{" "}
            <Link href="/contact" className="text-brand-accent hover:underline">
              Contact our support team →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
