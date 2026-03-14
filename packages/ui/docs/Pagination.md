# Pagination

Numbered page navigator. Renders nothing when `totalPages <= 1`.

## Platforms

| File | Platform |
|---|---|
| `Pagination.native.tsx` | React Native (Expo) |
| `Pagination.web.tsx` | Next.js — `<nav aria-label="Pagination">` |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `currentPage` | `number` | — | 1-based current page index |
| `totalPages` | `number` | — | Total number of pages |
| `onPageChange` | `(page: number) => void` | — | Called with new page number |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## Examples

```tsx
const [page, setPage] = useState(1);
const TOTAL = Math.ceil(totalCount / PAGE_SIZE);

<Pagination
  currentPage={page}
  totalPages={TOTAL}
  onPageChange={setPage}
/>
```

## Notes

- Previous/next buttons are disabled at the boundaries.
- Active page is highlighted with `bg-brand-primary`.
- Renders `null` when `totalPages` is `0` or `1`.

## Import

```ts
import { Pagination } from "@jefflink/ui";
```
