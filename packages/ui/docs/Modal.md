# Modal

Accessible overlay dialog. Traps body scroll (web) and renders a backdrop with close-on-tap behaviour.

## Platforms

| File | Platform |
|---|---|
| `Modal.native.tsx` | React Native — uses RN `Modal` |
| `Modal.web.tsx` | Next.js — `"use client"`, portal-style `fixed` overlay |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | — | Controls open/closed state |
| `onClose` | `() => void` | — | Called when backdrop or close button is tapped |
| `title` | `string` | — | Optional header title |
| `children` | `ReactNode` | — | Modal body content |
| `showCloseButton` | `boolean` | `true` | Renders an × close button in the header |
| `className` | `string` | `""` | Extra Tailwind classes applied to the panel |

## Accessibility

- Web: `role="dialog"`, `aria-modal="true"`, body scroll locked while open.
- Native: `accessibilityViewIsModal={true}` on the inner container.

## Examples

```tsx
const [open, setOpen] = useState(false);

<Button onPress={() => setOpen(true)}>Open Modal</Button>

<Modal
  visible={open}
  onClose={() => setOpen(false)}
  title="Confirm Delete"
>
  <p className="text-text-muted text-sm">
    This action cannot be undone. Are you sure?
  </p>
  <div className="flex gap-3 mt-4">
    <Button variant="ghost" onPress={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onPress={handleDelete}>Delete</Button>
  </div>
</Modal>
```

## Import

```ts
import { Modal } from "@jefflink/ui";
```
