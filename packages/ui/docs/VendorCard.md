# VendorCard

Compact card displaying a vendor's avatar, name, location, rating, and listing count.

## Platforms

| File | Platform |
|---|---|
| `VendorCard.native.tsx` | React Native (Expo) |
| `VendorCard.web.tsx` | Next.js |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Vendor identifier |
| `name` | `string` | — | Vendor display name |
| `logoUri` | `string` | — | Avatar / logo image URL |
| `location` | `string` | — | Vendor city / region |
| `listingsCount` | `number` | — | Number of active listings |
| `rating` | `number` | — | Average rating (e.g. `4.5`) |
| `isVerified` | `boolean` | — | Shows Verified badge |
| `onPress` | `() => void` | — | Navigate to vendor storefront |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## Examples

```tsx
<VendorCard
  id={vendor.id}
  name={vendor.name}
  logoUri={vendor.logoUrl}
  location={vendor.location}
  listingsCount={vendor.activeListings}
  rating={vendor.rating}
  isVerified={vendor.verified}
  onPress={() => router.push(`/vendors/${vendor.id}`)}
/>
```

## Import

```ts
import { VendorCard } from "@jefflink/ui";
```
