// Metro resolves Button.native.tsx; webpack/Next.js resolves Button.web.tsx
// Both satisfy this identical re-export — consumers import from "@jefflink/ui"
export { Button } from "./Button.web";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button.web";
