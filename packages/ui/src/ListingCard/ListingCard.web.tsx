import React from "react";
import { PriceTag } from "../PriceTag";
import { Badge } from "../Badge";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  imageUri?: string;
  sellerName?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  isSaved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  className?: string;
}

export function ListingCard({
  title,
  price,
  currency = "UGX",
  location,
  imageUri,
  sellerName,
  isVerified,
  isFeatured,
  isSaved,
  onPress,
  onSave,
  className = "",
}: ListingCardProps) {
  return (
    <div
      className={`bg-card rounded-card overflow-hidden border border-border/40 hover:border-brand-primary/30 transition-colors group ${className}`}
    >
      {/* Image */}
      <div className="relative bg-surface h-48 overflow-hidden">
        {imageUri ? (
          <img
            src={imageUri}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl text-text-muted">🖼️</div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {isFeatured ? <Badge label="Featured" variant="success" /> : null}
          {isVerified ? <Badge label="Verified" variant="info" /> : null}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-2 right-2 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition-colors"
          aria-label={isSaved ? "Unsave listing" : "Save listing"}
        >
          <span className="text-sm">{isSaved ? "♥" : "♡"}</span>
        </button>
      </div>

      {/* Body */}
      <button
        type="button"
        onClick={onPress}
        className="w-full text-left p-3 flex flex-col gap-1"
      >
        <p className="text-sm font-semibold text-text line-clamp-2">{title}</p>
        <p className="text-xs text-text-muted">📍 {location}</p>
        <div className="flex items-center justify-between mt-1">
          <PriceTag amount={price} currency={currency} />
          {sellerName ? <span className="text-xs text-text-muted">{sellerName}</span> : null}
        </div>
      </button>
    </div>
  );
}
