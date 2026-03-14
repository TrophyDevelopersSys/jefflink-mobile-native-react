# ListingGrid

Responsive grid container for rendering a list of items via a render-prop pattern.

## Platforms

| File | Platform |
|---|---|
| `ListingGrid.native.tsx` | React Native — renders a `FlatList` |
| `ListingGrid.web.tsx` | Next.js — renders a CSS grid |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | — | Array of items to render |
| `renderItem` | `(item: T, index: number) => ReactElement` | — | Render function for each item |
| `keyExtractor` | `(item: T) => string` | — | Unique key extractor |
| `columns` | `1 \| 2 \| 3 \| 4` | `3` | Number of columns (web responsive) |
| `emptyMessage` | `string` | `"No listings found."` | Message shown when `data` is empty |
| `className` | `string` | `""` | Extra Tailwind classes (web only) |

## Responsive columns (web)

| `columns` | Behaviour |
|---|---|
| `2` | 1 col → 2 col at `sm` |
| `3` | 1 col → 2 col at `sm` → 3 col at `lg` |
| `4` | 1 col → 2 col at `sm` → 3 col at `lg` → 4 col at `xl` |

## Examples

```tsx
<ListingGrid
  data={listings}
  keyExtractor={(l) => l.id}
  columns={3}
  renderItem={(listing) => (
    <ListingCard
      {...listing}
      onPress={() => router.push(`/listings/${listing.id}`)}
    />
  )}
/>
```

## Import

```ts
import { ListingGrid } from "@jefflink/ui";
```
