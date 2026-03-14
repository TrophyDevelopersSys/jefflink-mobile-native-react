# FilterPanel

Renders a set of `Select` dropdowns for faceted filtering. Supports collapsible layout.

## Platforms

| File | Platform |
|---|---|
| `FilterPanel.native.tsx` | React Native (Expo) |
| `FilterPanel.web.tsx` | Next.js |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `filters` | `FilterField[]` | — | Array of filter definitions |
| `onFilterChange` | `(key: string, value: string) => void` | — | Called when any filter changes |
| `onReset` | `() => void` | — | Clears all active filters |
| `collapsible` | `boolean` | `false` | Renders a toggle button to expand/collapse |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## `FilterField` shape

```ts
interface FilterField {
  key: string;         // Unique filter key (e.g. "category")
  label: string;       // Displayed placeholder (e.g. "Category")
  options: SelectOption[]; // { label, value } pairs
  value?: string;      // Currently selected value
}
```

## Examples

```tsx
const filters: FilterField[] = [
  {
    key: "category",
    label: "Category",
    options: [
      { label: "Electronics", value: "electronics" },
      { label: "Vehicles", value: "vehicles" },
    ],
    value: activeFilters.category,
  },
  {
    key: "location",
    label: "Location",
    options: locationOptions,
    value: activeFilters.location,
  },
];

<FilterPanel
  filters={filters}
  onFilterChange={(key, value) => setFilter(key, value)}
  onReset={clearFilters}
  collapsible
/>
```

## Import

```ts
import { FilterPanel } from "@jefflink/ui";
import type { FilterField } from "@jefflink/ui";
```
