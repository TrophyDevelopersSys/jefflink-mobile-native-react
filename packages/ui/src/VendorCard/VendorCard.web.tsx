import React from "react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";

export interface VendorCardProps {
  id: string;
  name: string;
  logoUri?: string;
  location?: string;
  listingsCount?: number;
  rating?: number;
  isVerified?: boolean;
  onPress?: () => void;
  className?: string;
}

export function VendorCard({
  name,
  logoUri,
  location,
  listingsCount,
  rating,
  isVerified,
  onPress,
  className = "",
}: VendorCardProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`bg-card rounded-card border border-border/40 p-4 flex items-center gap-3 w-full text-left hover:border-brand-primary/30 transition-colors ${className}`}
    >
      <Avatar name={name} imageUri={logoUri} size="lg" />
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text truncate">{name}</span>
          {isVerified ? <Badge label="Verified" variant="success" /> : null}
        </div>
        {location ? <span className="text-xs text-text-muted">📍 {location}</span> : null}
        <div className="flex gap-3 mt-1">
          {listingsCount !== undefined ? (
            <span className="text-xs text-text-muted">{listingsCount} listings</span>
          ) : null}
          {rating !== undefined ? (
            <span className="text-xs text-brand-warning">★ {rating.toFixed(1)}</span>
          ) : null}
        </div>
      </div>
      <span className="text-text-muted flex-shrink-0">›</span>
    </button>
  );
}
