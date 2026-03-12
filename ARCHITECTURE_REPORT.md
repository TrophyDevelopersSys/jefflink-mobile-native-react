# JeffLink Platform — Architecture Report

## Premium Appending: SEO Web Platform Integration into Existing Expo Mobile App
### Cross-Platform Monorepo (Next.js + Expo + Shared Packages)

**Report Date:** March 7, 2026  
**Author:** JeffLink Engineering Team  
**Project:** JeffLink Marketplace Platform  
**Classification:** Technical Architecture Document — Step 1 Foundation  

---

## Executive Summary

This report documents the architectural decision and implementation plan to append a **Next.js SEO-optimized web platform** to the existing **Expo React Native mobile application** (Android + iOS), both operating against the shared **JeffLink API** deployed at:

```
https://jefflink.onrender.com/api/v1
```

The solution adopted is a **Turborepo + pnpm monorepo** strategy that provides:

- A single repository housing both mobile and web applications
- Shared packages for design tokens, types, API client, authentication, and UI primitives
- 100% code reuse for business logic, types, and API calls
- 60–80% code reuse for UI primitives
- Platform-specific layers only where required (navigation, native charts)
- One command (`pnpm dev`) to launch the entire development environment

---

## 1. Current System State — Pre-Appending Audit

### 1.1 Mobile Application

| Attribute | Value |
|---|---|
| Framework | Expo 55 |
| React Native | 0.83.2 |
| React | 19.2.0 |
| Styling | NativeWind 4 (Tailwind CSS for React Native) |
| State Management | Zustand 5 |
| Navigation | React Navigation v7 (native-stack + bottom-tabs) |
| HTTP Client | Axios with JWT interceptors |
| Auth Storage | Expo SecureStore |
| Forms | React Hook Form 7 |
| Build Target | Android + iOS |

### 1.2 Backend API

| Attribute | Value |
|---|---|
| Runtime | Node.js / NestJS |
| Hosting | Render |
| Database | Neon PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Base URL | `https://jefflink.onrender.com/api/v1` |
| ORM | Drizzle |

### 1.3 Existing API Modules

The backend exposes the following REST modules already consumed by the mobile application:

```
/auth          — Login, register, refresh
/users         — User profiles and management
/vendors       — Vendor registration and dashboard
/listings      — Unified listing feed
/cars          — Car marketplace CRUD
/land          — Land/property listings CRUD
/ads           — Advertisement management
/payments      — Transaction handling
/subscriptions — Vendor subscription tiers
/leads         — Lead capture and tracking
/search        — Full-text search across entities
```

### 1.4 Existing Design Token System

The mobile application already has a mature brand palette:

```ts
// src/constants/colors.ts (existing, to be lifted to shared package)
export const colors = {
  brandPrimary:  "#0E7C3A",
  brandDark:     "#0F1115",
  brandNight:    "#13161C",
  brandSlate:    "#1A1D23",
  brandAccent:   "#22C55E",
  brandSuccess:  "#22C55E",
  brandWarning:  "#F59E0B",
  brandDanger:   "#DC2626",
  brandMuted:    "#9AA3AF",
  white:         "#FFFFFF",
  black:         "#000000",
};
```

### 1.5 Existing UI Component Library

26 hand-crafted production-ready components currently in `src/components/ui/`:

`AlertBanner`, `Avatar`, `Badge`, `BottomSheet`, `Button`, `Card`, `Checkbox`, `Chip`, `ConfirmModal`, `Divider`, `EmptyState`, `ErrorBoundary`, `IconButton`, `Input`, `Modal`, `Pagination`, `PriceDisplay`, `Radio`, `Select`, `Skeleton`, `Spinner`, `StatCard`, `StatusBadge`, `Stepper`, `Tabs`, `Toggle`

### 1.6 Identified Gap — SEO Limitation

React Native Web (`react-native-web 0.21.0`) is present in the current stack but is **not SEO-optimized**:

- Client-side rendered only
- No server-side rendering (SSR)
- No metadata generation for marketplace listings
- Search engines cannot index car listings, land listings, or vendor pages
- No Open Graph / structured data support

**Business Impact:** The JeffLink marketplace is invisible to Google, Bing, and other search engines, blocking organic traffic acquisition for the car and land resale marketplace.

---

## 2. Problem Statement

| Problem | Impact | Priority |
|---|---|---|
| No SSR for marketplace pages | Zero organic SEO traffic | Critical |
| No crawlable car listing pages | Cars undiscoverable on Google | Critical |
| No crawlable land listing pages | Properties undiscoverable | Critical |
| No vendor profile pages indexed | Vendor SEO opportunity lost | High |
| Duplicate brand config per platform | Design drift over time | Medium |
| Duplicate TypeScript types | Data inconsistency risk | Medium |
| Duplicate Axios client | Auth logic divergence risk | Medium |

---

## 3. Proposed Solution — Cross-Platform Monorepo

### 3.1 Strategy

Introduce **Next.js 15 (App Router)** as the web platform while preserving the existing Expo mobile application unchanged. Both platforms share business logic through a **pnpm workspace monorepo** orchestrated by **Turborepo**.

### 3.2 Repository Structure

```
jefflink/                          ← Root monorepo
│
├─ apps/
│   ├─ mobile/                     ← Existing Expo React Native app
│   │   ├─ src/
│   │   ├─ App.tsx
│   │   ├─ package.json
│   │   └─ ...
│   │
│   └─ web/                        ← NEW: Next.js 15 App Router
│       ├─ app/
│       │   ├─ layout.tsx
│       │   ├─ page.tsx
│       │   ├─ cars/
│       │   │   └─ [id]/page.tsx   ← SSR car listing detail
│       │   ├─ land/
│       │   │   └─ [id]/page.tsx   ← SSR land listing detail
│       │   └─ vendor/
│       │       └─ [id]/page.tsx   ← SSR vendor profile
│       ├─ package.json
│       └─ ...
│
├─ packages/
│   ├─ design-tokens/              ← Colors, spacing, radius, typography
│   ├─ types/                      ← Shared TypeScript interfaces
│   ├─ api/                        ← Axios API client + interceptors
│   ├─ auth/                       ← Login/logout/session utilities
│   ├─ ui/                         ← Cross-platform UI primitives
│   └─ utils/                      ← Shared helpers
│
├─ turbo.json                      ← Turborepo pipeline config
├─ pnpm-workspace.yaml             ← Workspace definition
├─ tailwind.config.base.js         ← Shared Tailwind tokens
└─ package.json                    ← Root scripts
```

---

## 4. Shared Package Specifications

### 4.1 `packages/design-tokens`

**Purpose:** Single source of truth for all brand colors, spacing, radius, and typography across mobile and web.

**Code Reuse: 100%**

```ts
// packages/design-tokens/src/colors.ts
export const colors = {
  brandPrimary:  "#0E7C3A",
  brandDark:     "#0F1115",
  brandNight:    "#13161C",
  brandSlate:    "#1A1D23",
  brandAccent:   "#22C55E",
  brandSuccess:  "#22C55E",
  brandWarning:  "#F59E0B",
  brandDanger:   "#DC2626",
  brandMuted:    "#9AA3AF",
  white:         "#FFFFFF",
  black:         "#000000",
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  card: 16, button: 12, input: 8, badge: 6,
};
```

**Consumers:** `apps/mobile` (replaces `src/constants/colors.ts`), `apps/web` (CSS custom properties), `tailwind.config.base.js`

---

### 4.2 `packages/types`

**Purpose:** Shared TypeScript interfaces preventing data model divergence between platforms and the backend.

**Code Reuse: 100%**

```ts
// packages/types/src/user.ts
export type UserRole = "CUSTOMER" | "DEALER" | "ADMIN";
export type UserStatus = "active" | "suspended" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
}

// packages/types/src/listing.ts
export type ListingType = "vehicle" | "property";

export interface ListingSummary {
  id: string;
  title: string;
  type: ListingType;
  location: string;
  price: string;
  coverUrl?: string;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  attributes: Record<string, string | number>;
}
```

---

### 4.3 `packages/api`

**Purpose:** Single Axios API client with JWT auth interceptors, shared by both platforms.

**Code Reuse: 100%**

```ts
// packages/api/src/client.ts
import axios from "axios";

export function createApiClient(getToken: () => Promise<string | null>) {
  const client = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
      ?? process.env.NEXT_PUBLIC_API_BASE_URL
      ?? "https://jefflink.onrender.com/api/v1",
    timeout: 30_000,
  });

  client.interceptors.request.use(async (req) => {
    const token = await getToken();
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  return client;
}
```

**Storage Adapter Pattern:**
- Mobile: `getToken` reads from `expo-secure-store`
- Web: `getToken` reads from httpOnly cookie via `/api/token` Next.js route

---

### 4.4 `packages/auth`

**Purpose:** Platform-agnostic auth utilities with platform-specific storage adapters.

**Code Reuse: ~90%**

```ts
// packages/auth/src/auth.ts
export interface AuthAdapter {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}

export async function login(
  credentials: { email: string; password: string },
  adapter: AuthAdapter,
  apiBaseUrl: string
): Promise<UserProfile> { ... }

export async function logout(adapter: AuthAdapter): Promise<void> { ... }
```

Platform-specific adapters:

| Platform | Storage Mechanism |
|---|---|
| Mobile (Expo) | `expo-secure-store` |
| Web (Next.js) | `httpOnly` cookie via Server Action |

---

### 4.5 `packages/ui`

**Purpose:** Cross-platform UI primitives using platform-specific file extensions resolved by bundlers.

**Code Reuse: 60–80%**

```
packages/ui/src/
├─ Button/
│   ├─ Button.native.tsx     ← Pressable + NativeWind
│   ├─ Button.web.tsx        ← <button> + Tailwind
│   └─ index.ts              ← Platform-agnostic export
├─ Card/
├─ Badge/
├─ Spinner/
├─ StatCard/
└─ index.ts
```

Bundler resolution:
- Metro (Expo): resolves `.native.tsx`
- Next.js / Webpack: resolves `.web.tsx`
- Both consume `index.ts` with identical import

---

### 4.6 `packages/utils`

**Purpose:** Shared pure utility functions with no platform dependencies.

```ts
// Shared utilities
export { formatPrice } from "./formatPrice";
export { formatDate } from "./formatDate";
export { truncate } from "./truncate";
export { slugify } from "./slugify";
export { parseJwt } from "./parseJwt";
```

---

## 5. Platform-Specific Layers

### 5.1 Mobile (apps/mobile)

| Layer | Technology | Scope |
|---|---|---|
| Navigation | React Navigation v7 | Mobile only |
| Charts | react-native-gifted-charts | Mobile only |
| Auth Storage | expo-secure-store | Mobile only |
| Push Notifications | Expo Notifications | Mobile only |
| Camera / Media | expo-image-picker | Mobile only |
| Screens | React Native Views | Mobile only |

### 5.2 Web (apps/web)

| Layer | Technology | Scope |
|---|---|---|
| Routing | Next.js App Router (file-based) | Web only |
| Charts | Recharts | Web only |
| Auth Storage | httpOnly cookies | Web only |
| SEO | `next/metadata` API | Web only |
| SSR / SSG | Next.js Server Components | Web only |
| Image Optimization | `next/image` | Web only |

---

## 6. Code Reuse Matrix

| Layer | Mobile | Web | Reuse % |
|---|---|---|---|
| Design Tokens | packages/design-tokens | packages/design-tokens | **100%** |
| TypeScript Types | packages/types | packages/types | **100%** |
| API Client | packages/api | packages/api | **100%** |
| Auth Logic | packages/auth | packages/auth | **~90%** |
| UI Primitives | packages/ui (.native) | packages/ui (.web) | **60–80%** |
| Utility Functions | packages/utils | packages/utils | **100%** |
| Screens/Pages | apps/mobile/src/screens | apps/web/app | **20–30%** |
| Navigation | React Navigation | Next.js Router | **0%** |
| Charts | gifted-charts | recharts | **0%** |

---

## 7. SEO Architecture — Next.js

### 7.1 Server-Side Rendered Routes

```
apps/web/app/
├─ page.tsx                      ← Homepage (SSG)
├─ cars/
│   ├─ page.tsx                  ← Car listings feed (ISR — 60s)
│   └─ [id]/
│       └─ page.tsx              ← Car detail (SSR + generateMetadata)
├─ land/
│   ├─ page.tsx                  ← Land listings feed (ISR — 60s)
│   └─ [id]/
│       └─ page.tsx              ← Land detail (SSR + generateMetadata)
├─ vendors/
│   └─ [id]/
│       └─ page.tsx              ← Vendor profile (SSR)
└─ search/
    └─ page.tsx                  ← Search results (SSR)
```

### 7.2 SEO Metadata Example

```tsx
// apps/web/app/cars/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const car = await fetchCar(params.id);
  return {
    title: `${car.title} — JeffLink`,
    description: car.description,
    openGraph: {
      images: [car.coverUrl],
    },
  };
}
```

### 7.3 Rendering Strategy

| Route | Strategy | Revalidation |
|---|---|---|
| Homepage | SSG | On deploy |
| Cars listing | ISR | 60 seconds |
| Car detail | SSR | Per request |
| Land listing | ISR | 60 seconds |
| Land detail | SSR | Per request |
| Vendor profile | SSR | Per request |
| Search results | SSR | Per request |
| Auth pages (login) | CSR | N/A |
| Dashboard (vendor) | CSR + Auth guard | N/A |

---

## 8. Development Environment

### 8.1 Turborepo Pipeline

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 8.2 Single Dev Command

```bash
pnpm dev
```

Launches in parallel:
1. **Expo** — Metro bundler for mobile development
2. **Next.js** — Web server on `localhost:3000`
3. **Shared package watchers** — TypeScript compilation in watch mode

### 8.3 Environment Variables

| Variable | Mobile | Web |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Yes | — |
| `NEXT_PUBLIC_API_BASE_URL` | — | Yes |
| Both point to: | `https://jefflink.onrender.com/api/v1` | `https://jefflink.onrender.com/api/v1` |

---

## 9. Migration Strategy

### Phase 1 (This Step) — Foundation

- [x] Turborepo + pnpm workspace initialized
- [x] `apps/mobile` — existing Expo app migrated
- [x] `apps/web` — Next.js 15 scaffolded
- [x] `packages/design-tokens` — brand palette extracted
- [x] `packages/types` — shared interfaces extracted
- [x] `packages/api` — Axios client extracted
- [x] `packages/auth` — auth utilities extracted
- [x] `packages/ui` — cross-platform Button, Card, Badge, Spinner scaffolded
- [x] `packages/utils` — shared helpers extracted
- [x] `tailwind.config.base.js` — shared Tailwind configuration
- [x] `turbo.json` pipeline configured
- [x] `pnpm dev` launches both apps

### Phase 2 — Web Marketplace Pages

- [ ] `/cars` — Car listing feed with SSR
- [ ] `/cars/[id]` — Car detail with SEO metadata
- [ ] `/land` — Land listing feed
- [ ] `/land/[id]` — Land detail with SEO metadata
- [ ] `/vendors/[id]` — Vendor profile pages

### Phase 3 — Shared Dashboard

- [ ] Vendor dashboard shared via `packages/ui` (`StatCard`, `ChartCard`)
- [ ] Web: `apps/web/app/vendor/dashboard/page.tsx`
- [ ] Mobile: `apps/mobile/src/screens/VendorDashboard.tsx`

### Phase 4 — Authentication Unification

- [ ] Web login with httpOnly cookies
- [ ] PKCE flow for mobile (existing `expo-auth-session`)
- [ ] `packages/auth` fully consumed by both platforms

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Metro resolver conflicts with pnpm symlinks | Medium | High | Use `unstable_enablePackageExports` in metro.config.js |
| NativeWind not resolving shared package CSS | Medium | High | Configure `content` paths in shared tailwind config |
| Render cold-start latency on SSR pages | High | Medium | ISR with 60s revalidation for listing pages |
| `react` version mismatch across packages | Low | High | Pin React 19.2.0 at root package.json |
| Type drift between packages | Low | Medium | `@jefflink/types` as single source of truth |

---

## 11. Technology Stack — Final

| Layer | Mobile | Web | Shared |
|---|---|---|---|
| UI Framework | Expo 55 + RN 0.83.2 | Next.js 15 | — |
| Styling | NativeWind 4 | Tailwind CSS 3 | tailwind.config.base.js |
| State | Zustand 5 | Zustand 5 | — |
| HTTP | packages/api (Axios) | packages/api (Axios) | ✓ |
| Auth | packages/auth + SecureStore | packages/auth + cookies | ✓ |
| Types | packages/types | packages/types | ✓ |
| Design | packages/design-tokens | packages/design-tokens | ✓ |
| UI Prims | packages/ui (.native) | packages/ui (.web) | ✓ |
| Build | Turborepo + pnpm | Turborepo + pnpm | ✓ |

---

## 12. Expected Outcomes After Step 1

| Outcome | Status |
|---|---|
| Monorepo runs from one repository | Achieved |
| Mobile app continues to work identically | Achieved |
| Next.js web app boots on localhost:3000 | Achieved |
| `pnpm dev` launches both apps | Achieved |
| Shared design tokens imported by both | Achieved |
| Shared types imported by both | Achieved |
| Shared API client imported by both | Achieved |
| Foundation ready for SEO marketplace pages | Achieved |
| CI/CD pipeline can build all targets | Achieved |

---

*This report serves as the technical specification and implementation record for the JeffLink platform monorepo transition. All subsequent feature work (marketplace SEO pages, vendor dashboards, payment flows) should reference this document for architectural decisions.*

---

**End of Report**
