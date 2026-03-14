# ListingCard

Displays a single marketplace listing with image, price, location, and save action.

## Platforms

| File | Platform |
|---|---|
| `ListingCard.native.tsx` | React Native (Expo) |
| `ListingCard.web.tsx` | Next.js |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Unique listing identifier |
| `title` | `string` | — | Listing title |
| `price` | `number` | — | Numeric price |
| `currency` | `string` | `"UGX"` | Currency code displayed with the price |
| `location` | `string` | — | Location label |
| `imageUri` | `string` | — | Listing cover image URL |
| `sellerName` | `string` | — | Seller display name |
| `isVerified` | `boolean` | — | Shows Verified badge on seller |
| `isFeatured` | `boolean` | — | Shows Featured badge on image |
| `isSaved` | `boolean` | — | Highlights the save/favourite button |
| `onPress` | `() => void` | — | Navigate to listing detail |
| `onSave` | `() => void` | — | Toggle saved state |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## Examples

```tsx
<ListingCard
  id={listing.id}
  title={listing.title}
  price={listing.price}
  location={listing.location}
  imageUri={listing.imageUrl}
  sellerName={listing.sellerName}
  isVerified={listing.sellerVerified}
  isFeatured={listing.featured}
  isSaved={savedIds.includes(listing.id)}
  onPress={() => router.push(`/listings/${listing.id}`)}
  onSave={() => toggleSave(listing.id)}
/>
```

## Import

```ts
import { ListingCard } from "@jefflink/ui";
```
