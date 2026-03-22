import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCmsPage } from "../../../src/lib/cms-fetch";
import CmsPageRenderer from "../../../src/components/cms/CmsPageRenderer";

export const revalidate = 60;

/* ── SEO metadata from CMS seo fields ──────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  if (!page) return { title: "Page Not Found" };

  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? `${page.title} — JeffLink`;
  const image = page.seo?.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

/* ── Page component ────────────────────────────────────────────────────────── */

export default async function CmsPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  if (!page) notFound();

  return (
    <main>
      <CmsPageRenderer layout={page.layout} />
    </main>
  );
}
