# Button

Cross-platform pressable component with configurable variants and sizes.

## Platforms

| File | Platform |
|---|---|
| `Button.native.tsx` | React Native (Expo) — uses `Pressable` |
| `Button.web.tsx` | Next.js — uses `<button>` |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Button label or content |
| `variant` | `"primary" \| "secondary" \| "danger" \| "ghost"` | `"primary"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Padding and text size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `onPress` | `() => void` | — | Press handler (both platforms) |
| `onClick` | `() => void` | — | Web alias for `onPress` |
| `className` | `string` | `""` | Extra Tailwind / NativeWind classes |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Web only — form button type |

## Variants

| Variant | Use case |
|---|---|
| `primary` | Main CTA — brand green background |
| `secondary` | Secondary action — slate background |
| `danger` | Destructive action — red background |
| `ghost` | Subtle/tertiary — transparent, outlined |

## Examples

```tsx
// Primary CTA
<Button onPress={handleSubmit}>Post Listing</Button>

// Danger action
<Button variant="danger" onPress={handleDelete}>Delete</Button>

// Loading state
<Button loading>Saving…</Button>

// Web form submit
<Button type="submit" variant="primary">Sign In</Button>
```

## Import

```ts
import { Button } from "@jefflink/ui";
```
