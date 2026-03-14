# Tabs

Horizontal tab bar with active indicator. Controls content via `activeKey`.

## Platforms

| File | Platform |
|---|---|
| `Tabs.native.tsx` | React Native (Expo) — `ScrollView` row |
| `Tabs.web.tsx` | Next.js — `role="tablist"` with border-bottom indicator |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `TabItem[]` | — | Tab definitions (key + label) |
| `activeKey` | `string` | — | Key of the currently selected tab |
| `onChange` | `(key: string) => void` | — | Called when a tab is pressed |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |

## `TabItem` shape

```ts
interface TabItem {
  key: string;   // Unique identifier
  label: string; // Display text
}
```

## Examples

```tsx
const TABS: TabItem[] = [
  { key: "listings", label: "Listings" },
  { key: "saved",    label: "Saved" },
  { key: "reviews",  label: "Reviews" },
];

const [activeTab, setActiveTab] = useState("listings");

<Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

{activeTab === "listings" && <ListingsPanel />}
{activeTab === "saved"    && <SavedPanel />}
{activeTab === "reviews"  && <ReviewsPanel />}
```

## Import

```ts
import { Tabs } from "@jefflink/ui";
import type { TabItem } from "@jefflink/ui";
```
