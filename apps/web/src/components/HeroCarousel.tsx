"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Banner data mirrors mobile HeroCarousel.tsx (4 identical slides) ──────────

type Banner = {
  id: string;
  brand: string;
  heading: string;
  tagline: string;
  /** Tailwind background gradient class */
  bg: string;
  /** Accent colour class for brand label */
  accent: string;
  /** Emoji car stand-in when no image is available */
  icon: string;
};

const BANNERS: Banner[] = [
  {
    id: "creta",
    brand: "HYUNDAI",
    heading: "New CRETA",
    tagline: "Choose from a range of cars.",
    bg: "from-brand-dark to-brand-primary/40",
    accent: "text-brand-accent",
    icon: "🚙",
  },
  {
    id: "subaru",
    brand: "SUBARU",
    heading: "SUBARU XV",
    tagline: "Explore verified vehicles from trusted sellers.",
    bg: "from-brand-dark to-[#1E40AF]/40",
    accent: "text-[#60A5FA]",
    icon: "🚘",
  },
  {
    id: "harrier",
    brand: "TOYOTA",
    heading: "TOYOTA HARRIER",
    tagline: "Flexible payment options like hire purchase.",
    bg: "from-brand-dark to-brand-warning/40",
    accent: "text-brand-warning",
    icon: "🚗",
  },
  {
    id: "c300",
    brand: "MERCEDES-BENZ",
    heading: "C 300 4MATIC Sedan",
    tagline: "Luxury vehicles available.",
    bg: "from-brand-black to-brand-slate/60",
    accent: "text-brand-muted",
    icon: "🏎️",
  },
];

const INTERVAL_MS = 4500; // matches mobile 4500ms interval

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback((dir: 1 | -1) => {
    const next = (indexRef.current + dir + BANNERS.length) % BANNERS.length;
    indexRef.current = next;
    setCurrent(next);
  }, []);

  const goTo = useCallback((idx: number) => {
    indexRef.current = idx;
    setCurrent(idx);
  }, []);

  // Restart timer whenever user manually navigates
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), INTERVAL_MS);
  }, [advance]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const banner = BANNERS[current]!;

  return (
    <section
      className={`relative bg-gradient-to-br ${banner.bg} overflow-hidden transition-all duration-700 min-h-[420px] md:min-h-[480px] flex flex-col justify-center`}
      aria-label={`Slide ${current + 1} of ${BANNERS.length}: ${banner.heading}`}
    >
      {/* Background decorative circle */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-white/[0.02] border border-white/5" />
        <div className="absolute -right-8 -bottom-16 w-[320px] h-[320px] rounded-full bg-white/[0.03] border border-white/5" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 w-full py-16 flex flex-col md:flex-row items-center gap-8">

        {/* ── Text side ── */}
        <div className="flex-1 min-w-0">
          {/* Brand label */}
          <p className={`text-xs font-black tracking-[0.25em] uppercase mb-3 ${banner.accent}`}>
            {banner.brand}
          </p>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-white tracking-tight leading-none mb-4">
            {banner.heading}
          </h2>

          {/* Tagline */}
          <p className="text-brand-muted text-base md:text-lg mb-8 max-w-md">
            {banner.tagline}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cars"
              className="bg-brand-primary text-brand-white text-sm font-semibold px-6 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
            >
              Browse Cars
            </Link>
            <Link
              href="/search"
              className="bg-brand-white/10 border border-brand-white/20 text-brand-white text-sm font-semibold px-6 py-3 rounded-button hover:bg-brand-white/15 transition-colors backdrop-blur-sm"
            >
              Search All Listings
            </Link>
          </div>
        </div>

        {/* ── Icon / visual side ── */}
        <div
          className="flex-shrink-0 text-[120px] md:text-[160px] select-none leading-none filter drop-shadow-2xl"
          aria-hidden="true"
          key={banner.id}
        >
          {banner.icon}
        </div>
      </div>

      {/* ── Controls: prev / next arrows + dot indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3" aria-label="Carousel navigation">
        {BANNERS.map((b, i) => (
          <button
            key={b.id}
            aria-label={`Go to slide ${i + 1}: ${b.heading}`}
            aria-current={i === current ? "true" : undefined}
            onClick={() => { goTo(i); startTimer(); }}
            className={`transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
              i === current
                ? "w-6 h-2 bg-brand-accent"
                : "w-2 h-2 bg-brand-white/30 hover:bg-brand-white/60"
            }`}
          />
        ))}
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={() => { advance(-1); startTimer(); }}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-black/30 hover:bg-brand-black/50 border border-brand-white/10 text-brand-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        ‹
      </button>
      <button
        onClick={() => { advance(1); startTimer(); }}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-black/30 hover:bg-brand-black/50 border border-brand-white/10 text-brand-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        ›
      </button>
    </section>
  );
}
