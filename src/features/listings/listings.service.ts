import type { ListingSummary } from "../../types/listing.types";

type ListingFeedType = "featured" | "recent";

type ListingResponse = {
  items: ListingSummary[];
};

// ── Static demo listings — no backend required ────────────────────────────────
const DEMO_LISTINGS: ListingSummary[] = [
  { id: "v-1",  title: "Toyota Prado 2022",       type: "vehicle",  location: "Kampala",    price: "UGX 120,000,000" },
  { id: "v-2",  title: "Mercedes C300 2021",       type: "vehicle",  location: "Entebbe",    price: "UGX 95,000,000"  },
  { id: "v-3",  title: "Subaru Forester 2020",     type: "vehicle",  location: "Kampala",    price: "UGX 75,000,000"  },
  { id: "v-4",  title: "Toyota Harrier 2023",      type: "vehicle",  location: "Jinja",      price: "UGX 110,000,000" },
  { id: "v-5",  title: "Hyundai Tucson 2022",      type: "vehicle",  location: "Mbarara",    price: "UGX 85,000,000"  },
  { id: "v-6",  title: "Land Cruiser V8 2019",     type: "vehicle",  location: "Kampala",    price: "UGX 175,000,000" },
  { id: "v-7",  title: "Nissan X-Trail 2021",      type: "vehicle",  location: "Gulu",       price: "UGX 68,000,000"  },
  { id: "v-8",  title: "BMW X5 2020",              type: "vehicle",  location: "Kampala",    price: "UGX 130,000,000" },
  { id: "p-1",  title: "50x100 Plot – Mbarara",    type: "property", location: "Mbarara",    price: "UGX 40,000,000"  },
  { id: "p-2",  title: "Roadside Plot – Mukono",   type: "property", location: "Mukono",     price: "UGX 55,000,000"  },
  { id: "p-3",  title: "100x100 Plot – Entebbe",   type: "property", location: "Entebbe",    price: "UGX 90,000,000"  },
  { id: "p-4",  title: "Commercial Plot – Jinja",  type: "property", location: "Jinja",      price: "UGX 72,000,000"  },
  { id: "p-5",  title: "Mailo Land – Wakiso",      type: "property", location: "Wakiso",     price: "UGX 48,000,000"  },
  { id: "p-6",  title: "50x100 Plot – Gulu",       type: "property", location: "Gulu",       price: "UGX 30,000,000"  },
  { id: "p-7",  title: "Corner Plot – Kampala",    type: "property", location: "Kampala",    price: "UGX 150,000,000" },
  { id: "p-8",  title: "Titled Land – Masaka",     type: "property", location: "Masaka",     price: "UGX 35,000,000"  },
];

export const listingsFeedService = {
  async getListings(type: ListingFeedType): Promise<ListingResponse> {
    // Simulate a minimal async tick so callers don't need to change.
    await Promise.resolve();
    const items = type === "recent"
      ? DEMO_LISTINGS.slice().reverse()
      : DEMO_LISTINGS;
    return { items };
  }
};
