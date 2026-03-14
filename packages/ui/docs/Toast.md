# Toast

Transient notification banner that auto-dismisses after a configurable duration.

## Platforms

| File | Platform |
|---|---|
| `Toast.native.tsx` | React Native (Expo) — bottom-anchored, animated |
| `Toast.web.tsx` | Next.js — `"use client"`, fixed bottom-centre |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `message` | `string` | — | Notification text |
| `variant` | `"success" \| "error" \| "warning" \| "info"` | `"success"` | Controls background colour and icon |
| `visible` | `boolean` | — | Controls whether the toast is shown |
| `onHide` | `() => void` | — | Called when the timer expires or × is pressed |
| `duration` | `number` | `3000` | Auto-dismiss delay in milliseconds |

## Variants

| Variant | Colour | Icon |
|---|---|---|
| `success` | brand green | ✓ |
| `error` | brand red | ✕ |
| `warning` | amber | ⚠ |
| `info` | blue | ℹ |

## Pattern — local state

```tsx
const [toast, setToast] = useState({ visible: false, message: "", variant: "success" as ToastVariant });

const showToast = (message: string, variant: ToastVariant = "success") => {
  setToast({ visible: true, message, variant });
};

// In render:
<Toast
  visible={toast.visible}
  message={toast.message}
  variant={toast.variant}
  onHide={() => setToast((t) => ({ ...t, visible: false }))}
/>
```

## Import

```ts
import { Toast } from "@jefflink/ui";
import type { ToastVariant } from "@jefflink/ui";
```
