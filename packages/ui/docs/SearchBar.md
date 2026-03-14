# SearchBar

Horizontal search input with optional inline filter selects.

## Platforms

| File | Platform |
|---|---|
| `SearchBar.native.tsx` | React Native (Expo) |
| `SearchBar.web.tsx` | Next.js |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `searchValue` | `string` | `""` | Controlled search text value |
| `onSearchChange` | `(value: string) => void` | — | Called on each keystroke |
| `onSearch` | `() => void` | — | Called when the search is submitted |
| `searchPlaceholder` | `string` | `"Search listings…"` | Input placeholder text |
| `filters` | `SearchFilter[]` | `[]` | Optional inline filter dropdowns |
| `onFilterChange` | `(key: string, value: string) => void` | — | Called when an inline filter changes |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## `SearchFilter` shape

```ts
interface SearchFilter {
  key: string;
  label: string;
  options: SelectOption[]; // { label, value }
  value?: string;
}
```

## Examples

```tsx
// Simple search input only
<SearchBar
  searchValue={query}
  onSearchChange={setQuery}
  onSearch={handleSearch}
/>

// With inline category filter
<SearchBar
  searchValue={query}
  onSearchChange={setQuery}
  onSearch={handleSearch}
  filters={[
    {
      key: "category",
      label: "Category",
      options: categoryOptions,
      value: selectedCategory,
    },
  ]}
  onFilterChange={(key, val) => setSelectedCategory(val)}
/>
```

## Import

```ts
import { SearchBar } from "@jefflink/ui";
import type { SearchFilter } from "@jefflink/ui";
```
