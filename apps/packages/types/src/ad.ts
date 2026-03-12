export type AdStatus = "active" | "paused" | "expired";
export type AdPlacement = "feed" | "search" | "listing_detail" | "homepage";

export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  placement: AdPlacement;
  status: AdStatus;
  vendorId: string;
  impressions: number;
  clicks: number;
  expiresAt?: string;
}
