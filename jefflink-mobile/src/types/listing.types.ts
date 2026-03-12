export type ListingType = "vehicle" | "property";

export interface ListingSummary {
  id: string;
  title: string;
  type: ListingType;
  location: string;
  price: string;
  coverUrl?: string;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  attributes: Record<string, string | number>;
}
