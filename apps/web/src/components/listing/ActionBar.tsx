"use client";

import Link from "next/link";
import { useState } from "react";

interface ActionBarProps {
  listingId: string;
  contactLabel: string;
  vendorPhone?: string;
}

export default function ActionBar({ listingId, contactLabel, vendorPhone }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (typeof navigator.share === "function") {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share — silently ignore
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/contact?listingId=${listingId}`}
        className="w-full bg-brand-primary text-brand-white font-semibold px-6 py-3.5 rounded-button text-center hover:bg-brand-primary/90 transition-colors text-sm"
      >
        {contactLabel}
      </Link>

      <Link
        href={`/hire-purchase?listingId=${listingId}`}
        className="w-full bg-brand-accent text-black font-bold px-6 py-3.5 rounded-button text-center hover:bg-brand-accent/90 transition-colors text-sm"
      >
        Apply for Hire Purchase
      </Link>

      {vendorPhone && (
        <a
          href={`tel:${vendorPhone}`}
          className="w-full bg-brand-slate border border-border text-brand-white font-semibold px-6 py-3.5 rounded-button text-center hover:border-brand-primary/50 transition-colors text-sm"
        >
          📞 Call Seller
        </a>
      )}

      <button
        type="button"
        onClick={handleShare}
        className="w-full bg-brand-slate border border-border text-brand-white font-medium px-6 py-3 rounded-button text-center hover:border-brand-primary/50 transition-colors text-sm"
      >
        {copied ? "✓ Link Copied!" : "🔗 Share Listing"}
      </button>
    </div>
  );
}
