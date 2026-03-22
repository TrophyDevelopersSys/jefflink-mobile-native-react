"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  CmsLayout,
  CmsHeroBlock,
  CmsTextBlock,
  CmsImageBlock,
  CmsCtaBlock,
  CmsStatsBlock,
  CmsTestimonialsBlock,
  CmsFaqBlock,
  CmsSliderItem,
  CmsBannerItem,
  CmsContentBlock,
  CmsListBlock,
} from "@jefflink/types";
import {
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sanitizeHtml } from "../../lib/sanitize";

/* ── Safe HTML renderer ─────────────────────────────────────────────────────── */

function SafeHtml({ html }: { html: string }) {
  return (
    <div
      className="prose prose-green max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────────── */

function HeroSection({ block }: { block: CmsHeroBlock }) {
  return (
    <section
      className="relative flex items-center justify-center min-h-[400px] bg-cover bg-center text-white"
      style={block.backgroundImageUrl ? { backgroundImage: `url(${block.backgroundImageUrl})` } : undefined}
    >
      {block.backgroundImageUrl && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className={`relative z-10 max-w-3xl px-6 py-16 text-${block.alignment ?? "center"}`}>
        <h1 className="text-4xl font-bold mb-4">{block.heading}</h1>
        {block.subheading && <p className="text-lg mb-6 opacity-90">{block.subheading}</p>}
        {block.ctaLabel && block.ctaLink && (
          <Link
            href={block.ctaLink}
            className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {block.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}

/* ── Text Block ──────────────────────────────────────────────────────────────── */

function TextSection({ block }: { block: CmsTextBlock }) {
  if (block.format === "html") return <SafeHtml html={block.content} />;
  return <p className="whitespace-pre-wrap text-[var(--color-text)]">{block.content}</p>;
}

/* ── Image Block ─────────────────────────────────────────────────────────────── */

function ImageSection({ block }: { block: CmsImageBlock }) {
  return (
    <figure className="my-6">
      <Image
        src={block.imageUrl}
        alt={block.alt ?? ""}
        width={block.width ?? 800}
        height={block.height ?? 450}
        className="rounded-lg mx-auto"
      />
      {block.caption && (
        <figcaption className="text-center text-sm text-[var(--color-text-muted)] mt-2">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── CTA ─────────────────────────────────────────────────────────────────────── */

function CtaSection({ block }: { block: CmsCtaBlock }) {
  return (
    <section className="rounded-xl bg-[var(--color-primary)] text-white p-10 text-center">
      <h2 className="text-2xl font-bold mb-3">{block.heading}</h2>
      {block.description && <p className="mb-6 opacity-90">{block.description}</p>}
      <Link
        href={block.buttonLink}
        className="inline-block px-6 py-3 rounded-lg bg-white text-[var(--color-primary)] font-semibold hover:opacity-90 transition-opacity"
      >
        {block.buttonLabel}
      </Link>
    </section>
  );
}

/* ── Stats ───────────────────────────────────────────────────────────────────── */

function StatsSection({ block }: { block: CmsStatsBlock }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center my-8">
      {block.items.map((s, i) => (
        <div key={i} className="p-4 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
          <div className="text-3xl font-bold text-[var(--color-primary)]">{s.value}</div>
          <div className="text-sm text-[var(--color-text-muted)] mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Testimonials ────────────────────────────────────────────────────────────── */

function TestimonialsSection({ block }: { block: CmsTestimonialsBlock }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {block.items.map((t, i) => (
        <div key={i} className="p-6 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
          <p className="italic text-[var(--color-text)] mb-4">&ldquo;{t.quote}&rdquo;</p>
          <div className="flex items-center gap-3">
            {t.avatarUrl && (
              <Image src={t.avatarUrl} alt={t.name} width={40} height={40} className="rounded-full" />
            )}
            <div>
              <div className="font-semibold text-sm">{t.name}</div>
              {t.role && <div className="text-xs text-[var(--color-text-muted)]">{t.role}</div>}
            </div>
            {typeof t.rating === "number" && (
              <div className="ml-auto flex gap-0.5 text-yellow-500">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="currentColor" />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────────── */

function FaqSection({ block }: { block: CmsFaqBlock }) {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div className="space-y-3 my-8">
      {block.items.map((item, i) => (
        <div key={i} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 text-left font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.question}
            {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-[var(--color-text-muted)]">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Legacy sections (slider, header, body, lists) ───────────────────────────── */

function SliderSection({ items }: { items: CmsSliderItem[] }) {
  if (!items.length) return null;
  return (
    <div className="relative overflow-hidden rounded-lg">
      {items.map((s, i) => (
        <div key={i} className="relative h-64 md:h-96 bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }}>
          <div className="absolute inset-0 bg-black/40 flex items-end p-6">
            <div className="text-white">
              {s.title && <h2 className="text-xl font-bold">{s.title}</h2>}
              {s.subtitle && <p className="opacity-80">{s.subtitle}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BannerSection({ items }: { items: CmsBannerItem[] }) {
  if (!items.length) return null;
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      {items.map((b, i) => (
        <div key={i} className="relative rounded-lg overflow-hidden h-48 bg-cover bg-center" style={{ backgroundImage: `url(${b.imageUrl})` }}>
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-white text-center">
              {b.alt && <h3 className="text-lg font-bold">{b.alt}</h3>}
              {b.link && (
                <Link href={b.link} className="text-sm underline opacity-80">Learn more</Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BodySection({ items }: { items: CmsContentBlock[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-8 my-6">
      {items.map((sec, i) => (
        <section key={i}>
          {sec.key && <h2 className="text-2xl font-bold mb-3">{sec.key}</h2>}
          {sec.type === "html" ? (
            <SafeHtml html={sec.value} />
          ) : (
            <p className="whitespace-pre-wrap text-[var(--color-text)]">{sec.value}</p>
          )}
        </section>
      ))}
    </div>
  );
}

function ListSection({ items }: { items: CmsListBlock[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-8 my-6">
      {items.map((list, i) => (
        <section key={i}>
          {list.title && <h2 className="text-xl font-bold mb-3">{list.title}</h2>}
          {list.listingType && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing {list.listingType} listings{list.limit ? ` (up to ${list.limit})` : ""}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}

/* ── Main CMS Page Renderer ──────────────────────────────────────────────────── */

export default function CmsPageRenderer({ layout }: { layout: CmsLayout }) {
  return (
    <article className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero blocks */}
      {layout.hero?.map((block, i) => <HeroSection key={`hero-${i}`} block={block} />)}

      {/* Slider */}
      {layout.slider && layout.slider.length > 0 && <SliderSection items={layout.slider} />}

      {/* Banners */}
      {layout.header && layout.header.length > 0 && <BannerSection items={layout.header} />}

      {/* Stats */}
      {layout.stats?.map((block, i) => <StatsSection key={`stats-${i}`} block={block} />)}

      {/* Body content */}
      {layout.body && layout.body.length > 0 && <BodySection items={layout.body} />}

      {/* Text blocks */}
      {layout.textBlocks?.map((block, i) => (
        <section key={`text-${i}`} className="my-6">
          <TextSection block={block} />
        </section>
      ))}

      {/* Images */}
      {layout.images?.map((block, i) => <ImageSection key={`img-${i}`} block={block} />)}

      {/* CTA */}
      {layout.cta?.map((block, i) => <CtaSection key={`cta-${i}`} block={block} />)}

      {/* Testimonials */}
      {layout.testimonials?.map((block, i) => <TestimonialsSection key={`test-${i}`} block={block} />)}

      {/* Lists */}
      {layout.lists && layout.lists.length > 0 && <ListSection items={layout.lists} />}

      {/* FAQ */}
      {layout.faq?.map((block, i) => <FaqSection key={`faq-${i}`} block={block} />)}
    </article>
  );
}
