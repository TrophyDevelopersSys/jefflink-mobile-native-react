export interface VendorProfile {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  location: string;
  phone?: string;
  email?: string;
  subscriptionTier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  isVerified: boolean;
  createdAt: string;
}

export interface VendorStats {
  totalListings: number;
  activeListings: number;
  totalLeads: number;
  totalViews: number;
}
