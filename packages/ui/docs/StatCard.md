# StatCard

Dashboard metric tile showing a label, a headline value, and an optional trend delta.

## Platforms

| File | Platform |
|---|---|
| `StatCard.native.tsx` | React Native (Expo) |
| `StatCard.web.tsx` | Next.js |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Metric name (e.g. `"Total Listings"`) |
| `value` | `string \| number` | — | Headline figure (e.g. `142` or `"UGX 4.2M"`) |
| `delta` | `string` | — | Optional change string (e.g. `"12%"`) |
| `positive` | `boolean` | — | Green delta when `true`, red when `false` |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## Examples

```tsx
// Basic
<StatCard label="Total Listings" value={142} />

// With positive trend
<StatCard
  label="Revenue"
  value="UGX 4.2M"
  delta="18%"
  positive
/>

// With negative trend
<StatCard
  label="Cancellations"
  value={7}
  delta="3"
  positive={false}
/>

// Dashboard row
<div className="flex gap-4">
  <StatCard label="Active Listings" value={listings.active} />
  <StatCard label="Sold"            value={listings.sold} delta="5%" positive />
  <StatCard label="Views"           value={listings.views} />
</div>
```

## Import

```ts
import { StatCard } from "@jefflink/ui";
```
