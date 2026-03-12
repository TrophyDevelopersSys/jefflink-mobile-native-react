export interface Lead {
  id: string;
  listingId: string;
  vendorId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  message?: string;
  status: "new" | "contacted" | "converted" | "closed";
  createdAt: string;
}
