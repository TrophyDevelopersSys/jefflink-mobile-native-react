# JeffLink Platform — Knowledge Bank
> **Last Updated:** March 15, 2026  
> **Purpose:** Living reference document. Update this file after every major change to architecture, modules, or data flows. No need to re-analyse the codebase from scratch — start here.

---

## Table of Contents
1. [Platform Overview](#1-platform-overview)
2. [Monorepo Architecture](#2-monorepo-architecture)
3. [Mobile App — jefflink-mobile](#3-mobile-app--jefflink-mobile)
4. [Backend API — NestJS](#4-backend-api--nestjs)
5. [Database Schema](#5-database-schema)
6. [Shared Packages](#6-shared-packages)
7. [Web App — Next.js](#7-web-app--nextjs)
8. [Android Build](#8-android-build)
9. [Data Flow Diagrams](#9-data-flow-diagrams)
10. [Brand & Design Tokens](#10-brand--design-tokens)
11. [Environment & Deployment](#11-environment--deployment)
12. [Key Conventions](#12-key-conventions)
13. [Update Log](#13-update-log)

---

## 1. Platform Overview

**JeffLink** is a hire-purchase & marketplace platform for vehicles, properties, and financial products — targeting Zambia/East Africa markets.

| Layer | Technology | Host |
|-------|-----------|------|
| Mobile App | Expo 55 + React Native 0.83.2 | EAS Build |
| Web App | Next.js 15.2.3 | Vercel / Render |
| Backend API | NestJS 10 + Drizzle ORM | Render |
| Database | Neon PostgreSQL (serverless) | Neon Cloud |
| Cache | Redis (ioredis) | Render Redis |
| Search | Meilisearch | Render |
| File Storage | Cloudflare R2 (`jefflink-storage` bucket) | Cloudflare |
| Media CDN | Cloudflare CDN (`cdn.jefflinkcars.com`) | Cloudflare |
| Job Queue | BullMQ | Render |
| Error Monitoring | Sentry | Sentry Cloud |

**API Base URL:** `https://api.jefflinkcars.com/api/v1`

**User Roles:** `CUSTOMER` | `VENDOR` | `ADMIN`

---

## 2. Monorepo Architecture

```
jefflinkapp/                        ← Workspace root
├── .github/
│   ├── KNOWLEDGE_BANK.md           ← THIS FILE
│   └── skills/jefflink/SKILL.md    ← Copilot Skill
├── packages/                       ← Shared NPM packages (@jefflink/*)
│   ├── api/                        ← Axios client factory
│   ├── auth/                       ← Platform-agnostic auth logic
│   ├── design-tokens/              ← Brand colors, spacing, typography
│   ├── types/                      ← Shared TypeScript interfaces
│   ├── ui/                         ← Shared React components
│   └── utils/                      ← Shared utility functions
├── apps/
│   ├── mobile/                     ← Duplicate/experimental mobile (Expo)
│   └── web/                        ← Next.js web app
├── jefflink-mobile/                ← PRIMARY mobile app (Expo + React Native)
│   ├── src/                        ← App source code
│   ├── backend/                    ← NestJS API server
│   ├── android/                    ← Android native project
│   └── database/                   ← SQL schema & migrations
├── database/                       ← Root-level DB scripts (mirrors jefflink-mobile/database)
├── backend/                        ← Root-level backend (mirrors jefflink-mobile/backend)
├── turbo.json                      ← Build pipeline orchestration
├── pnpm-workspace.yaml             ← Workspace: apps/web, packages/*, jefflink-mobile
└── package.json                    ← Root scripts: dev, build, type-check, lint, test
```

**Package Manager:** pnpm 9.15.0  
**Build Orchestrator:** Turbo 2.5.2  
**Node:** ≥ 20.0.0

**Turbo Tasks:**
```
dev → build → type-check → lint → test
```

> ⚠️ **Note:** The directory has some duplication (`apps/mobile`, `jefflink-mobile`, `my-expo-app`). The **canonical mobile app** is `jefflink-mobile/`. The canonical backend is `jefflink-mobile/backend/`.

---

## 3. Mobile App — jefflink-mobile

### 3.1 Stack

| Concern | Solution |
|---------|---------|
| Framework | Expo 55 + React Native 0.83.2 |
| Language | TypeScript (strict) |
| Styling | NativeWind 4 (Tailwind CSS for RN) |
| State | Zustand 5 |
| Navigation | React Navigation v7 (native-stack + bottom-tabs) |
| HTTP | Axios with JWT interceptors |
| Auth Storage | Expo SecureStore |
| Forms | React Hook Form 7 |
| Icons | lucide-react-native |

### 3.2 Directory Map

```
jefflink-mobile/
├── App.tsx              ← Root: GestureHandlerRootView + RootNavigator
├── index.ts             ← Entry point
├── app.json             ← Expo config (pkg: com.jefflink.mobile)
├── eas.json             ← EAS build profiles
├── src/
│   ├── api/             ← Axios instance + API modules
│   ├── appRoot/         ← AppProviders.tsx (ThemeProvider > SafeAreaProvider > AuthProvider)
│   ├── assets/          ← Images, fonts, icons
│   ├── components/      ← Reusable UI components
│   │   ├── ui/          ← Base: Button, Input, Card, Badge, Modal, Spinner...
│   │   ├── layout/      ← AppChrome, Header, ScreenWrapper, RoleGuard...
│   │   ├── ads/         ← Ad banner/card components
│   │   ├── cards/       ← Specialised card variants
│   │   ├── dashboard/   ← Dashboard widgets
│   │   ├── feed/        ← Feed row/grid components
│   │   ├── finance/     ← Finance display components
│   │   ├── gps/         ← Location/map components
│   │   ├── hero/        ← Hero sections
│   │   ├── listing/     ← Listing tile/detail components
│   │   ├── marketplace/ ← Marketplace category UI
│   │   ├── search/      ← Search bar & results UI
│   │   ├── sections/    ← Page section layouts
│   │   └── wallet/      ← Wallet balance/history UI
│   ├── constants/       ← Colors, endpoints, roles, messages, spacing
│   ├── context/         ← AuthContext, ThemeContext, RoleContext
│   ├── features/        ← Business logic modules (service + hooks + types)
│   │   ├── auth/
│   │   ├── cars/
│   │   ├── listings/
│   │   ├── property/
│   │   ├── finance/
│   │   ├── wallet/
│   │   ├── vendor/
│   │   ├── search/
│   │   ├── notifications/
│   │   ├── feed/
│   │   ├── ads/
│   │   └── profile/
│   ├── hooks/           ← useAuth, useListings, usePayments, useRoleGuard, useAnalytics
│   ├── navigation/      ← RootNavigator → Auth/Customer/Vendor/Admin navigators
│   ├── screens/         ← Screens by role: auth/, customer/, vendor/, admin/, shared/
│   ├── store/           ← Zustand stores: auth, listing, payment, user
│   ├── theme/           ← Theme config
│   ├── types/           ← user, listing, payment, ad, contract, feed types
│   └── utils/           ← tokenManager, secureStorage, formatCurrency, validators
```

### 3.3 API Layer (`src/api/`)

**Axios Instance:** `src/api/axios.ts`
- Base URL: `https://jefflink.onrender.com/api/v1`
- Request interceptor → Auto-inject `Authorization: Bearer {token}`
- Response interceptor → 401 triggers `clearSession()` (logout)

**API Modules:**
| File | Exports |
|------|---------|
| `auth.api.ts` | `login()`, `register()`, `me()` |
| `listings.api.ts` | `getListings()`, `getListing()`, `createListing()` |
| `payments.api.ts` | `getPayments()`, `getPayment()` |
| `wallet.api.ts` | `getWallet()`, `requestWithdrawal()` |
| `users.api.ts` | `getProfile()`, `updateProfile()`, `uploadAvatar()` |
| `admin.api.ts` | Admin CRUD operations |

**All Endpoints:** `src/constants/endpoints.ts`
```
/auth/login          POST  — Login
/auth/register       POST  — Register
/auth/me             GET   — Current user
/listings/vehicles   GET   — Vehicle listings
/listings/properties GET   — Property listings
/listings/{id}       GET   — Single listing
/listings/search     GET   — Full-text search
/payments            GET   — Payment history
/payments/{id}       GET   — Single payment
/wallet              GET   — Wallet summary
/wallet/transactions GET   — Transaction history
# Dashboard & Analytics
/admin/dashboard                       GET    — Live stats (users, contracts, vehicles, revenue)
/admin/analytics/revenue               GET    — Monthly revenue timeline
/admin/analytics/activity              GET    — Recent audit-log activity
# Users
/admin/users                           GET    — Paginated user list (search param)
/admin/users/:id/status                PATCH  — Update user status (ACTIVE|SUSPENDED|BANNED)
# Vendors
/admin/vendors                         GET    — Paginated vendor profiles
/admin/vendors/:id/verify              PATCH  — Verify vendor (sets VERIFIED + verifiedAt)
/admin/vendors/:id/suspend             PATCH  — Suspend vendor
# Listings
/admin/listings/pending                GET    — Pending vehicle listings
/admin/listings/vehicles/:id/approve   PATCH  — Approve vehicle listing
/admin/listings/vehicles/:id/reject    PATCH  — Reject vehicle listing
/admin/listings/properties/pending     GET    — Pending property listings
/admin/listings/properties/:id/approve PATCH  — Approve property listing
/admin/listings/properties/:id/reject  PATCH  — Reject property listing
# Reports
/admin/reports                         GET    — Listing reports (paginated, filterable by status)
/admin/reports/:id/resolve             PATCH  — Resolve/dismiss a report
# Finance
/admin/finance/summary                 GET    — Finance KPI summary (revenue, overdue, etc.)
/admin/contracts                       GET    — Contract list (admin)
/admin/payments                        GET    — Payment records
/admin/installments                    GET    — Installment overview
/admin/withdrawals                     GET    — Vendor withdrawal queue
/admin/withdrawals/:id/approve         PATCH  — Approve withdrawal
/admin/withdrawals/:id/reject          PATCH  — Reject withdrawal
# Legacy / Sync
/admin/recovery                        GET    — Recovery cases
/admin/sync                            GET    — Sync/platform health status
/admin/audit-logs                      GET    — Immutable admin action log
/users/me            GET   — Profile
/users/me/avatar     POST  — Avatar upload
/media/upload        POST  — Media upload
```

### 3.4 State Management (`src/store/`)

All stores use **Zustand v5** curried pattern.

| Store | Hook | Key State |
|-------|------|-----------|
| Auth | `useAuthStore` | `token`, `user`, `status`, `isGuest`, `initialized` |
| Listings | `useListingStore` | `listings[]`, `selectedListing`, `filters` |
| Payments | `usePaymentStore` | `transactions[]`, `balance`, `history` |
| User | `useUserStore` | `profile`, `preferences` |

**Auth Status Values:** `"idle"` | `"loading"` | `"authenticated"` | `"unauthenticated"` | `"error"`

**Auth Actions:** `setSession()`, `clearSession()`, `setStatus()`, `setError()`, `setGuestMode()`, `patchAvatar()`

### 3.5 Contexts (`src/context/`)

```
ThemeProvider
  └── SafeAreaProvider
        └── AuthProvider   (wraps useAuthStore → AuthContext)
              └── {app children}
```

| Context | Hook | Provides |
|---------|------|---------|
| AuthContext | `useAuthContext()` | `user`, `token`, `status`, `isGuest`, `isAuthenticated` |
| ThemeContext | `useThemeContext()` | `theme`, `setTheme` (light/dark) |
| RoleContext | `useRoleContext()` | `role`, `can()` (permission check) |

### 3.6 Navigation (`src/navigation/`)

```
RootNavigator
├── [NOT authenticated] → AuthNavigator
│     ├── LoginScreen
│     └── RegisterScreen
└── [Authenticated] → role-based navigator
      ├── [CUSTOMER] → CustomerNavigator
      │     ├── Tab: Home      → HomeScreen
      │     ├── Tab: Listings  → ListingsScreen → ListingDetailsScreen
      │     ├── Tab: Wallet    → PaymentsScreen
      │     └── Tab: Profile   → ProfileScreen, SellScreen
      ├── [VENDOR] → VendorNavigator
      │     ├── Dashboard      → VendorDashboardScreen
      │     ├── Analytics      → VendorAnalyticsScreen
      │     ├── Leads          → VendorLeadsScreen
      │     └── Boost          → BoostListingScreen
      └── [ADMIN] → AdminNavigator (Stack)
            ├── AdminTabs (BottomTab — tabBar hidden)
            │     ├── Dashboard  → DashboardScreen   (live: stats + recent activity)
            │     ├── Users      → UsersScreen        (live: FlatList + status management)
            │     ├── Contracts  → ContractsScreen    (live: FlatList, UGX amounts)
            │     ├── Payments   → PaymentsScreen     (live: FlatList, method + paidAt)
            │     └── Recovery   → RecoveryScreen
            └── MonitorSync → MonitorSyncScreen       (live: sync health + platform stats)
```

### 3.7 Feature Modules (`src/features/`)

Each feature follows the pattern:
```
features/{name}/
├── index.ts       ← Barrel export
├── types.ts       ← Feature-specific types
├── service.ts     ← API calls & business logic
├── hooks.ts       ← React hooks
└── constants.ts   ← Feature constants
```

| Feature | Key Hooks |
|---------|-----------|
| `auth` | `useAuthFlow()`, `useLogin()`, `useRegister()` |
| `listings` | `useListings()`, `useListing(id)`, `useCreateListing()` |
| `cars` | Car browsing, filtering, purchase flow |
| `wallet` | `useWallet()`, balance & transactions |
| `vendor` | `useVendorDashboard()`, leads, analytics |
| `property` | Property listings management |
| `finance` | Financial products |
| `search` | `useSearch(query)` |
| `notifications` | Notification center |
| `feed` | Feed algorithm & rendering |
| `ads` | Advertisement management |
| `profile` | User profile editing |

### 3.8 Key Hooks (`src/hooks/`)

```typescript
useAuth()        → { initialize, login, logout, register, status, error, user, token }
useListings(q?)  → { listings, loading, error, refetch }
useListing(id)   → { listing, loading, error }
usePayments()    → { transactions, balance, loading }
useWallet()      → { balance, transactions, requestWithdrawal }
useRoleGuard(roles) → { hasAccess }
useAnalytics()   → { track, trackEvent, trackPageView }
```

### 3.9 Constants (`src/constants/`)

```typescript
// Brand Colors (colors.ts)
Primary:   "#0E7C3A"   // Main green
Accent:    "#22C55E"   // Light green
Dark:      "#0F1115"   // Charcoal
Night:     "#13161C"   // Deep navy
Slate:     "#1A1D23"   // Slate gray
Warning:   "#F59E0B"   // Amber
Danger:    "#DC2626"   // Red
Muted:     "#9AA3AF"   // Gray

// Roles (roles.ts)
CUSTOMER | VENDOR | ADMIN
```

---

## 4. Backend API — NestJS

### 4.1 Stack

| Concern | Solution |
|---------|---------|
| Framework | NestJS 10.3.10 |
| Database ORM | Drizzle ORM 0.33.0 |
| Auth | JWT (passport-jwt) |
| Validation | class-validator + ValidationPipe |
| Logging | nestjs-pino (structured JSON) |
| Rate Limiting | @nestjs/throttler (120 req/min) |
| Error Monitoring | @sentry/node |
| Password Hashing | bcryptjs (12 rounds) |

### 4.2 Module Map

```
backend/src/
├── main.ts              ← Bootstrap: Sentry, Helmet, CORS, ValidationPipe, versioning
├── app.module.ts        ← Root: ConfigModule, LoggerModule, ThrottlerModule + all features
├── config/              ← app, database, jwt, redis, storage config loaders
├── database/            ← DatabaseModule + Drizzle schema
├── redis/               ← RedisModule + RedisService (ioredis)
├── queue/               ← QueueModule (BullMQ)
├── common/
│   ├── decorators/      ← @Public(), @CurrentUser(), @Roles()
│   ├── guards/          ← JwtAuthGuard, RolesGuard
│   ├── interceptors/    ← LoggingInterceptor, TransformInterceptor
│   └── dto/             ← PaginationDto
└── modules/
    ├── auth/            ← AuthModule: login, register, refresh, me
    ├── users/           ← UsersModule: profile, avatar
    ├── cars/            ← CarsModule: vehicle CRUD + finance eligibility
    ├── properties/      ← PropertiesModule: property listings
    ├── transactions/    ← TransactionsModule: payment history + invoices
    ├── wallet/          ← WalletModule: vendor balance + withdrawals
    ├── admin/           ← AdminModule: full RBAC admin infrastructure
    │     ├── services/  ← admin-analytics, admin-users, admin-listings,
    │     │                 admin-vendors, admin-finance, audit-log services
    │     └── dto/       ← typed DTOs for all admin actions
    ├── media/           ← MediaModule: R2 upload (memory), presigned URLs, image optimization
    ├── cms/             ← CmsModule: hero sliders, banners, content blocks (NEW)
    ├── search/          ← SearchModule: Meilisearch full-text
    ├── notifications/   ← NotificationsModule: push + in-app
    └── health/          ← HealthModule: liveness probes
```

### 4.3 Auth Module

**Endpoints:**
```
POST /api/v1/auth/register   ← { email, password, name, phone }
POST /api/v1/auth/login      ← { email, password }
POST /api/v1/auth/refresh    ← { refreshToken }
GET  /api/v1/auth/me         ← Bearer token required
```

**Token Strategy:**
- Access Token: Short-lived JWT (15 min default)
- Refresh Token: Long-lived JWT (7 days default)
- Stored in: Expo SecureStore (mobile), httpOnly cookie (web)

**Response format (login/register):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "...",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "CUSTOMER", "avatarUrl": "..." }
}
```

### 4.4 Decorators & Guards

```typescript
@Public()                      // Skip JWT auth
@CurrentUser() user: UserPayload  // Inject current user
@Roles('ADMIN', 'VENDOR')      // RBAC guard
JwtAuthGuard                   // Applied globally
RolesGuard                     // Applied where @Roles() used
```

### 4.5 Response Wrapper

All API responses are wrapped by `TransformInterceptor`:
```json
{ "success": true, "data": { ... } }
```

### 4.6 Key Configuration

```typescript
// app.config.ts
port: 3000
throttleTtl: 60s
throttleLimit: 120 requests/min
cache.listings: 300s TTL
cache.search: 120s TTL
cache.profile: 600s TTL

// database.config.ts
pool.min: 2, pool.max: 10

// storage.config.ts — Cloudflare R2 (jefflink-storage bucket)
// Keys: accountId, accessKeyId, secretAccessKey, bucket, publicUrl
// Env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
```

### 4.7 Backend Scripts

```bash
npm run start:dev       # NestJS watch mode
npm run build           # Compile TypeScript
npm run db:generate     # Drizzle schema generation
npm run db:migrate      # Run pending migrations
npm run db:push         # Push schema changes to DB
npm run db:studio       # Open Drizzle Studio (DB browser)
```

---

## 5. Database Schema

### 5.1 Overview

**Database:** Neon PostgreSQL (serverless)  
**ORM:** Drizzle (TypeScript)  
**Migration files:** `database/jefflink_finance_*.sql`  
**Extension:** `pgcrypto` (UUID generation)

### 5.2 Entity-Relationship Overview

```
roles ──< users >── branches
              │
              ├──< vendors >── wallets
              │         └──< vendor_withdrawals
              │         └──< vehicles
              │         └──< properties
              │         └──< ads
              │
              └──< contracts >── installments
                         └──< payments
                         └──< contract_status_transitions
                         └──< contract_status_audit

accounts >── journal_lines >── journal_entries
ledger_transactions
penalty_policies, penalty_config
```

### 5.3 Core Tables

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `roles` | id, name | CUSTOMER, VENDOR, ADMIN |
| `branches` | id, name, location | Geographic branches |
| `users` | id, role_id, branch_id, email, phone, national_id, tin, status | All platform users |
| `vendors` | id, user_id, company_name, commission_rate, subscription_plan, is_verified | Vendor profiles |
| `wallets` | id, vendor_id (UNIQUE), balance NUMERIC(18,2) | One per vendor |
| `vendor_withdrawals` | id, vendor_id, amount, status | PENDING→APPROVED→PAID |
| `vehicles` | id, vendor_id, make, model, year, chassis_number (UNIQUE), status | AVAILABLE/SOLD/REPOSSESSED |
| `properties` | id, vendor_id, type, location, plot_size, price, status | AVAILABLE/SOLD/PENDING |
| `ads` | id, vendor_id, ad_type, location, price_per_period, duration_days, status | Ad inventory |
| `contracts` | id, user_id, vehicle_id, branch_id, cash_price, hire_price, down_payment, interest_rate, term_months, status | Hire-purchase FSM |
| `installments` | id, contract_id, due_date, amount_due, penalty_amount, amount_paid, status | PENDING/PAID/OVERDUE |
| `payments` | id, contract_id, amount, payment_date, method, status | PENDING/COMPLETED/FAILED |
| `vendor_profiles` | id, userId, businessName, businessType, verificationStatus (PENDING/VERIFIED/REJECTED/SUSPENDED), verifiedBy, verifiedAt, suspendedAt, suspensionReason | Drizzle-managed vendor KYC & verification — **NEW** |
| `listing_reports` | id, listingId, listingType, reporterId, reason, description, status (OPEN/RESOLVED/DISMISSED), resolution, resolutionNote, resolvedBy, resolvedAt | User-submitted listing reports — **NEW** |
| `admin_logs` | id, adminId, action, entityType, entityId, previousState, newState, ipAddress, userAgent, metadata, createdAt | Immutable admin audit trail — **NEW** |
| `media_assets` | id, uploadedBy, bucket, key, url, thumbnailUrl, mimeType, sizeBytes, referenceId, referenceType, isCover, **status** (ACTIVE/DELETED), createdAt | R2 file metadata. `status` column added 2026-03-15 |
| `cms_sliders` | id, title, subtitle, image_url (R2 CDN URL), button_label, button_link, sort_order, active, created_at, updated_at | Hero carousel slides. Images served from `cdn.jefflinkcars.com` — **NEW** |
| `cms_banners` | id, placement, image_url, link_url, alt_text, active, starts_at, ends_at, created_at, updated_at | Promotional banners keyed by placement (e.g. `home_top`) — **NEW** |
| `cms_content` | id, key (UNIQUE), value, type (text/html/json/url), description, updated_at | Key-value store for all CMS text, SEO meta tags, labels. Never stores media — **NEW** |
| `accounts` | id, account_type_id, code, name, balance | Chart of accounts |
| `journal_entries` | id, reference_id, entry_date, description | Double-entry bookkeeping |
| `journal_lines` | id, entry_id, account_id, debit_amount, credit_amount | Ledger lines |
| `ledger_transactions` | id, transaction_type, reference_id, posting_date, amount | Ledger ledger |

### 5.4 Contract FSM States

```
DRAFT → UNDER_REVIEW → APPROVED → ACTIVE → DEFAULT_WARNING → DEFAULT → REPOSSESSION → CLOSED
                  ↘ CANCELLED          ↘ OVERDUE ↗
```

**Key Triggers:**
- `enforce_contract_transition()` — Validates allowed FSM transitions
- `auto_generate_installments_on_activation()` — Creates payment schedule on ACTIVE
- `auto_create_recovery_case()` — Creates recovery case on DEFAULT
- `enforce_contract_closure_balance()` — Prevents CLOSED with outstanding balance
- `trg_contract_status_transition` — Fires on every status change, writes to audit log

### 5.5 Stored Functions

```sql
generate_installments_for_contract(contract_id, start_date)
create_ledger_transaction(type, ref_id, user_id, description, debit_acct, credit_acct, amount)
request_vendor_withdrawal(vendor_id, amount)   -- Deducts wallet, creates PENDING withdrawal
process_vendor_withdrawal(withdrawal_id, status, ...)  -- Admin approves/rejects
```

---

## 6. Shared Packages

All in `packages/` — published as `@jefflink/*` — referenced via `workspace:*`.

### 6.1 @jefflink/types (`packages/types/`)

```typescript
// user.ts
UserRole = "CUSTOMER" | "VENDOR" | "ADMIN"
UserProfile { id, email, name, role, avatarUrl, phone }
TokenPayload { sub, email, role, iat, exp }

// listing.ts
ListingType = "VEHICLE" | "PROPERTY"
ListingSummary { id, title, price, type, thumbnailUrl, status }
ListingDetail extends ListingSummary { description, vendor, specs, media[] }

// payment.ts
PaymentStatus = "PENDING" | "COMPLETED" | "FAILED"
WalletSummary { balance, pendingWithdrawals, lastUpdated }

// vendor.ts
VendorProfile { id, companyName, isVerified, subscriptionPlan, commissionRate }
VendorStats { totalListings, totalRevenue, activContracts, leads }

// ad.ts
AdStatus = "ACTIVE" | "INACTIVE" | "EXPIRED"
AdPlacement = "HOME_BANNER" | "SEARCH_TOP" | "LISTING_SIDEBAR"
```

### 6.2 @jefflink/api (`packages/api/`)

```typescript
createApiClient(options: { getToken, onUnauthorized? }): AxiosInstance
createListingsApi(client)   // listing endpoints
createVendorsApi(client)    // vendor endpoints
```

### 6.3 @jefflink/auth (`packages/auth/`)

```typescript
// Adapter pattern — platform-agnostic storage
AuthAdapter = { setToken, getToken, clearToken }

login(credentials, adapter): Promise<AuthResult>
logout(adapter): Promise<void>
refreshToken(refreshTokenValue, adapter): Promise<string | null>
getSession(adapter): Promise<TokenPayload | null>
```

### 6.4 @jefflink/design-tokens (`packages/design-tokens/`)

```typescript
// colors.ts
colors: { brandPrimary="#0E7C3A", brandAccent="#22C55E", brandDark="#0F1115",
          brandNight="#13161C", brandSlate="#1A1D23", brandWarning="#F59E0B",
          brandDanger="#DC2626", brandMuted="#9AA3AF", ... }

// spacing.ts
spacing: { none=0, xs=4, sm=8, md=16, lg=24, xl=32, xxl=48, xxxl=64 }

// radius.ts  
radius: { none=0, badge=6, input=8, button=12, card=16, modal=20, full=9999 }

// typography.ts — Tailwind class strings
typography: { display, title, subtitle, body, caption, label }

// shadows.ts  ← NEW
shadows: { sm, md, lg, xl, card }   // CSS box-shadow strings (web)
elevation: { sm=2, md=4, lg=8, xl=12, card=6 }  // RN elevation integers (Android)

// breakpoints.ts  ← NEW
breakpoints: { sm=640, md=768, lg=1024, xl=1280, xxl=1536 }  // numeric px values
```

### 6.5 @jefflink/ui (`packages/ui/`)

All components ship as dual-render: `ComponentName.native.tsx` (RN + NativeWind) and `ComponentName.web.tsx` (HTML + Tailwind). Metro picks `.native` automatically; web bundlers use the default `.ts` barrel.

**Import:** `import { ListingCard, Toast } from "@jefflink/ui"`

#### Primitives

| Component | Key Props |
| --------- | --------- |
| `Button` | `variant: primary\|secondary\|danger\|ghost`, `size: sm\|md\|lg`, `loading`, `disabled` |
| `Badge` | `variant: default\|success\|warning\|danger\|info`, `label` |
| `Spinner` | `size`, `color` |
| `Input` | `label`, `error`, `leftIcon`, `rightIcon` |
| `Select` | `options: SelectOption[]`, `value`, `onChange` — bottom-sheet native / `<select>` web |
| `PriceTag` | `amount` (UGX auto-formatted), `size: sm\|md\|lg` |
| `Avatar` | `uri?`, `name?` (initials fallback), `size: xs\|sm\|md\|lg\|xl` |

#### Search & Filter

| Component | Key Props |
| --------- | --------- |
| `SearchBar` | `filters: SearchFilter[]`, `onSearch` |
| `FilterPanel` | `fields: FilterField[]`, `values`, `onChange`, `onReset` |

#### Listing Display

| Component | Key Props |
| --------- | --------- |
| `Card` | Base wrapper, `pressable?`, `onPress` |
| `ListingCard` | `listing: ListingSummary`, `onSave`, `onPress` |
| `ListingGrid` | `listings[]`, `onSelect`, `columns: 1\|2` (native) / 1–4 cols responsive (web) |
| `ImageGallery` | `images: string[]`, lightbox overlay |

#### Vendor

| Component | Key Props |
| --------- | --------- |
| `VendorCard` | `vendor: VendorProfile`, `listingCount`, `rating` |

#### Engagement

| Component | Key Props |
| --------- | --------- |
| `FavoriteButton` | `saved`, `onToggle` — heart toggle with ARIA |
| `ActionBar` | `price`, `onContact`, `onCall`, `onChat` — sticky bottom bar |

#### Navigation & Structure

| Component | Key Props |
| --------- | --------- |
| `Tabs` | `tabs: TabItem[]`, `active`, `onChange` |
| `Pagination` | `page`, `totalPages`, `onChange` |
| `Modal` | `visible`, `onClose`, `title` — bottom-sheet native / centered overlay web |

#### Map

| Component | Key Props |
| --------- | --------- |
| `MapView` | `lat`, `lng`, `zoom?` — OSM iframe (web) / stub with install note (native) |

#### Feedback

| Component | Key Props |
| --------- | --------- |
| `Toast` | `message`, `variant: success\|error\|warning\|info`, `visible`, `onHide` — auto-hides |

#### Dashboard

| Component | Key Props |
| --------- | --------- |
| `StatCard` | `label`, `value`, `change` |

### 6.6 @jefflink/utils (`packages/utils/`)

```typescript
formatPrice(amount, currency?)       // "ZMW 1,500.00"
formatCompactPrice(amount)           // "ZMW 1.5K"
formatDate(date, format?)            // "Mar 12, 2026"
formatRelativeTime(date)             // "2 hours ago"
truncate(str, length)                // "Hello Wo..."
slugify(str)                         // "hello-world"
capitalize(str)                      // "Hello World"
```

---

## 7. Web App — Next.js

```
apps/web/
├── app/               ← Next.js 15 app directory (App Router)
│   ├── layout.tsx     ← Root layout
│   ├── page.tsx       ← Homepage (ISR, revalidate 60s)
│   ├── not-found.tsx  ← 404
│   ├── about/         ← Static about page
│   ├── cars/          ← Vehicle marketplace (ISR) + [id] dynamic
│   ├── commercial/    ← Commercial properties (ISR) + [id] dynamic
│   ├── contact/       ← Static contact page
│   ├── dashboard/     ← User dashboard + /profile sub-route
│   ├── houses/        ← Residential listings (force-dynamic) + [id] dynamic
│   ├── how-it-works/  ← Static explainer page
│   ├── land/          ← Land parcels (force-dynamic) + [id] dynamic
│   ├── login/         ← Auth: login
│   ├── register/      ← Auth: register
│   ├── robots.txt     ← Static robots.txt
│   ├── search/        ← Search results page
│   ├── sell/          ← Seller onboarding page
│   ├── sitemap.xml    ← Static sitemap
│   └── vendors/       ← Vendor directory + [id] dynamic
└── src/
    └── components/    ← React components (Navbar, etc.)
```

**Stack:** Next.js 15.5.12 | React 19 | Tailwind CSS 3.4.19 | Zustand 5 | Recharts 2.15.1

**Route Rendering Strategy:**
| Route | Strategy | Notes |
|-------|----------|-------|
| `/` | ISR (revalidate 60s) | Homepage with featured listings |
| `/cars` | ISR (revalidate 60s) | Fetches API at build + revalidates |
| `/commercial` | ISR (revalidate 60s) | Fetches API at build + revalidates |
| `/vendors` | ISR (revalidate 60s) | Vendor directory |
| `/houses` | `force-dynamic` | API called at request time (avoids cold-start timeout) |
| `/land` | `force-dynamic` | API called at request time (avoids cold-start timeout) |
| `/cars/[id]` | Dynamic (ƒ) | Server-rendered on demand |
| `/houses/[id]` | Dynamic (ƒ) | Server-rendered on demand |
| `/land/[id]` | Dynamic (ƒ) | Server-rendered on demand |
| `/commercial/[id]` | Dynamic (ƒ) | Server-rendered on demand |
| `/vendors/[id]` | Dynamic (ƒ) | Server-rendered on demand |
| All others | Static (○) | No data fetching |

> ⚠️ **Why `/houses` and `/land` are `force-dynamic`:** The backend API is on Render's free tier and cold-starts in 30–90s. Next.js enforces a 60s per-page build timeout. These pages use `force-dynamic` + `cache: 'no-store'` to skip build-time fetching entirely.

---

## 8. Android Build

```
jefflink-mobile/android/
├── app/
│   ├── build.gradle      ← App build: compileSdk 34, minSdk 24, targetSdk 34
│   ├── proguard-rules.pro ← Code obfuscation
│   └── src/
│       ├── debug/        ← Debug config (network security, debug tools)
│       ├── debugOptimized/ ← Debug with optimization
│       └── main/         ← Main source (AndroidManifest, Java/Kotlin, res/)
├── build.gradle          ← Project-level: NDK, CMake versions
├── gradle.properties     ← Gradle settings (JVM config, Expo modules)
├── settings.gradle       ← Module inclusions + Expo module discovery
└── local.properties      ← SDK path (gitignored)
```

**App Identifier:** `com.jefflink.mobile`  
**Build Config:**
- `compileSdk`: 34
- `minSdk`: 24
- `targetSdk`: 34

**EAS Profiles** (`eas.json`):
```json
development: { distribution: "internal", android.buildType: "debug" }
preview:     { distribution: "internal" }
production:  { autoIncrement: true }
```

---

## 9. Data Flow Diagrams

### 9.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTH FLOW                                  │
└─────────────────────────────────────────────────────────────┘

User Input (email + password)
        │
        ▼
[LoginScreen / RegisterScreen]
        │ useAuthFlow() hook
        ▼
@jefflink/auth.login(credentials, secureStoreAdapter)
        │
        ▼ POST /api/v1/auth/login
┌───────────────────────┐
│  NestJS AuthController │
│  AuthService.login()  │
│  ↓ bcrypt.compare()   │
│  ↓ issueTokens()      │
│  JWT sign (RS256)     │
└───────────┬───────────┘
            │ { accessToken, refreshToken, user }
            ▼
SecureStore.setItem('token', accessToken)
SecureStore.setItem('refresh', refreshToken)
            │
            ▼
useAuthStore.setSession({ token, user })
            │
            ▼
AuthContext.isAuthenticated = true
            │
            ▼
RootNavigator → CustomerNavigator | VendorNavigator | AdminNavigator

─── TOKEN REFRESH ─────────────────────────────────────────────

Axios interceptor catches 401
        │
        ▼
refreshToken(storedRefreshToken, adapter)
        │ POST /api/v1/auth/refresh
        ▼
New accessToken returned
        │
        ▼
SecureStore updated, retry original request
```

### 9.2 API Request Flow

```
┌────────────────────────────────────────────────────────────┐
│                   API CALL FLOW                             │
└────────────────────────────────────────────────────────────┘

Screen renders
        │
        ▼
Custom hook: useListings({ type: 'VEHICLE', page: 0 })
        │
        ▼
listings.service.ts → listings.api.ts
        │
        ▼
Axios instance (auto-injects Bearer token)
        │ GET /api/v1/listings/vehicles?page=0&limit=20
        ▼
┌──────────────────────────────────┐
│  NestJS ListingsController       │
│  ListingsService.getAllListings() │
│  ↓ Check Redis cache (300s TTL)  │
│  ↓ [miss] Drizzle query Neon DB  │
│  ↓ Store in Redis cache          │
│  TransformInterceptor wraps resp │
└──────────────┬───────────────────┘
               │ { success: true, data: [...] }
               ▼
Response interceptor processes data
               │
               ▼
useListingStore.setListings(data)   (Zustand)
               │
               ▼
Component re-renders with new data
```

### 9.3 Hire-Purchase Contract Lifecycle

```
┌────────────────────────────────────────────────────────────┐
│              CONTRACT FSM (Postgres Triggers)               │
└────────────────────────────────────────────────────────────┘

     DRAFT ──→ UNDER_REVIEW ──→ APPROVED ──→ ACTIVE
       │              │               │         │
       │              ↓               ↓         ├─→ DEFAULT_WARNING
       │          CANCELLED       CANCELLED     │         │
       │                                        │         ├─→ ACTIVE (payment)
       │                                        │         └─→ DEFAULT
       │                                        │                │
       │                                        ├─→ OVERDUE      ├─→ REPOSSESSION
       │                                        │         │      └─→ CLOSED
       │                                        │         └─→ ACTIVE (payment)
       │                                        └─→ CLOSED (all paid)

 On ACTIVE: trigger auto_generate_installments_on_activation()
            → Creates N installment records based on term_months

 On DEFAULT: trigger auto_create_recovery_case()
             → Creates recovery_cases record

 Every transition: trg_contract_status_transition
                   → Logs to contract_status_audit (who, when, from, to, reason)
```

### 9.4 Vendor Withdrawal Flow

```
┌────────────────────────────────────────────────────────────┐
│              VENDOR WITHDRAWAL FLOW                         │
└────────────────────────────────────────────────────────────┘

Vendor taps "Request Withdrawal" ($1,000)
        │
        ▼
useWallet().requestWithdrawal(1000)
        │ POST /api/v1/wallet/withdraw
        ▼
┌──────────────────────────────┐
│  WalletService               │
│  ↓ CALL request_vendor_      │
│    withdrawal(vendor_id,1000)│
│  DB Function:                │
│   1. LOCK wallet FOR UPDATE  │
│   2. CHECK balance >= 1000   │
│   3. wallet.balance -= 1000  │
│   4. INSERT vendor_withdrawals│
│      (status: PENDING)       │
└──────────────┬───────────────┘
               │ { withdrawalId, status: "PENDING" }
               ▼
Admin sees pending in AdminNavigator
               │
               ▼
POST /api/v1/admin/withdrawals/{id}/approve
               │
               ▼
┌──────────────────────────────┐
│  AdminService                │
│  CALL process_vendor_        │
│    withdrawal(id,'APPROVED') │
│  DB Function:                │
│   1. create_ledger_          │
│      transaction(...)        │
│   2. INSERT journal_lines    │
│   3. status = 'APPROVED'     │
│   4. Emit payment webhook    │
└──────────────────────────────┘
```

### 9.5 Search Flow

```
┌────────────────────────────────────────────────────────────┐
│                  SEARCH FLOW                               │
└────────────────────────────────────────────────────────────┘

User types "Honda Civic 2022"
        │
        ▼ (debounced 300ms)
useSearch("Honda Civic 2022")
        │ GET /api/v1/listings/search?q=Honda+Civic+2022
        ▼
┌──────────────────────┐
│  SearchService       │
│  ↓ Redis cache?      │──→ [HIT] Return cached (120s TTL)
│  [MISS]              │
│  ↓ Meilisearch.search│
│  Apply facet filters │
│  Sort by relevance   │
│  Cache results 120s  │
└──────────┬───────────┘
           │ Paginated results []
           ▼
useListingStore.setSearchResults(data)
           │
           ▼
ListingsScreen re-renders with filtered results
```

### 9.6 Media Upload Flow (Direct-to-R2)

```
User picks image from gallery/camera
        │ expo-image-picker
        ▼
POST /api/v1/media/presign { path, contentType }
        │
        ▼
┌────────────────────────────┐
│  MediaService              │
│  getSignedUrl(PutObject)   │
│  expiresIn: 300s           │
└──────────┬─────────────────┘
           │ { uploadUrl (signed), publicUrl (CDN), expiresIn }
           ▼
Client PUTs binary directly to R2
  (zero bytes through API server)
           │
           ▼
Public URL: https://cdn.jefflinkcars.com/<path>
           │
           ▼
Stored in listing.imageUrl / media_assets.url / user.avatarUrl
```

**Fallback (multipart):** `POST /api/v1/media/upload` still supported for server-side uploads.
- Uses `multer.memoryStorage()` (no disk writes)
- sharp compresses to WebP (max 1920×1080, quality 82)
- Streams buffer to R2 via `PutObjectCommand`
- Inserts row in `media_assets` table

**R2 Bucket Structure:**
```
jefflink-storage/
├── cms/sliders/          ← hero carousel images
├── cms/banners/          ← promo banners
├── cms/pages/            ← static page images
├── cars/<carId>/         ← car listing photos
├── houses/<propertyId>/  ← house listing photos
├── land/<propertyId>/    ← land listing photos
├── vendors/<vendorId>/   ← vendor branding
├── users/avatars/<userId>/
└── documents/            ← contracts, KYC (keep private)
```

### 9.7 CMS Data Flow

```
Frontend (homepage load)
        │
        ▼
GET /api/v1/cms/homepage   (no auth required)
        │
        ▼
┌──────────────────────────────┐
│  CmsService.getHomepage()    │
│  3 parallel Neon DB queries: │
│  1. cmsSliders (active, asc) │
│  2. cmsBanners (placement=   │
│     home_top, in-schedule)   │
│  3. cmsContent (all keys)    │
└──────────────┬───────────────┘
               │
               ▼
{
  heroSliders: [{ title, subtitle, imageUrl(R2), buttonLabel, buttonLink }],
  heroBanners: [{ imageUrl(R2), linkUrl, altText }],
  content: { "homepage_hero_title": "...", "seo_homepage_title": "..." }
}
               │
               ▼
Images load from cdn.jefflinkcars.com (Cloudflare edge)
Text rendered directly — no extra fetches
```

---

## 10. Brand & Design Tokens

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `brandPrimary` | `#0E7C3A` | Buttons, active states, CTA |
| `brandAccent` | `#22C55E` | Success, highlights, accents |
| `brandDark` | `#0F1115` | Background (dark mode) |
| `brandNight` | `#13161C` | Cards (dark mode) |
| `brandSlate` | `#1A1D23` | Secondary bg (dark mode) |
| `brandWarning` | `#F59E0B` | Warnings, pending states |
| `brandDanger` | `#DC2626` | Errors, destructive actions |
| `brandMuted` | `#9AA3AF` | Disabled, secondary text |

### Typography Scale
Managed in `@jefflink/design-tokens/typography` + Tailwind config.

### Spacing
Tailwind spacing scale + NativeWind for RN.

---

## 11. Environment & Deployment

### Environment Variables (Backend)
```env
DATABASE_URL=          # Neon PostgreSQL connection string
JWT_SECRET=            # JWT signing key
JWT_REFRESH_SECRET=    # Refresh token signing key
JWT_EXPIRES_IN=        # e.g. 15m
JWT_REFRESH_EXPIRES_IN=# e.g. 7d
REDIS_URL=             # Redis connection string
WEB_APP_URL=           # Frontend base URL used in password reset links
SMTP_URL=              # Optional full SMTP connection string
SMTP_HOST=             # SMTP server host (if SMTP_URL is not used)
SMTP_PORT=587          # SMTP server port
SMTP_SECURE=false      # true for implicit TLS, false for STARTTLS/plain
SMTP_USER=             # SMTP username (optional if relay is open)
SMTP_PASS=             # SMTP password
SMTP_BREVO_LOGIN=      # Optional Brevo SMTP login alias accepted by backend
SMTP_BREVO_API_KEY=    # Optional Brevo SMTP key alias accepted by backend
MAIL_FROM=             # Sender email for password reset emails
MAIL_FROM_NAME=        # Sender display name
MAIL_REPLY_TO=         # Support/reply-to email
# Cloudflare R2 (primary file storage)
R2_ACCOUNT_ID=         # Cloudflare account ID
R2_ACCESS_KEY_ID=      # R2 API token key ID
R2_SECRET_ACCESS_KEY=  # R2 API token secret
R2_BUCKET=jefflink-storage
R2_PUBLIC_URL=https://cdn.jefflinkcars.com
MEILISEARCH_HOST=      # Meilisearch URL
MEILISEARCH_API_KEY=   # Meilisearch API key
SENTRY_DSN=            # Sentry error tracking
```

### Render Services (`render.yaml`)

Both services build from workspace root (`rootDir: .`) so Turbo cache spans all packages.

| Service | Name | Build Command | Start Command | URL |
|---------|------|---------------|---------------|-----|
| Web (Next.js) | `jefflink-web` | `pnpm install --frozen-lockfile --prod=false && pnpm turbo run build --filter=@jefflink/web` | `pnpm --filter @jefflink/web start` | https://jefflinkcars.com |
| API (NestJS) | `jefflink-api` | `pnpm install --frozen-lockfile --prod=false && pnpm turbo run build --filter=jefflink-backend` | `node apps/backend/dist/main.js` | https://api.jefflinkcars.com |

**DNS (Cloudflare CNAMEs):**
```
www  → jefflink-web.onrender.com
api  → jefflink-api.onrender.com
cdn  → pub-ac2067b6a2264561b99c6c807174ff78.r2.dev  (Proxied)
```

**File Storage:** Cloudflare R2 (not AWS S3 — see `R2_*` env vars in render.yaml)

**Production Render Checklist:**

- API required secrets: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, `ADMIN_SEED_PASSWORD`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- API required fixed values: `NODE_ENV=production`, `ADMIN_SEED_EMAIL=admin@jefflinkcars.com`, `ADMIN_SEED_ROLE=SUPER_ADMIN`, `WEB_APP_URL=https://jefflinkcars.com`, `R2_PUBLIC_URL=https://cdn.jefflinkcars.com`, `CDN_BASE_URL=https://cdn.jefflinkcars.com`, `AUTH_EXPOSE_RESET_TOKEN=false`.
- Web required fixed values: `NODE_ENV=production`, `NEXT_PUBLIC_API_BASE_URL=/api/v1`, `BACKEND_URL=http://jefflink-api:10000`, `INTERNAL_API_URL=http://jefflink-api:10000/api/v1`, `NEXT_PUBLIC_SITE_URL=https://jefflinkcars.com`, `NEXT_PUBLIC_CDN_URL=https://cdn.jefflinkcars.com`.
- Drift check after any env change: redeploy `jefflink-api` first, then `jefflink-web`; verify `/api/health`, production admin login, password-reset email delivery, and CDN media URLs.

> ⚠️ **pnpm + Render gotcha:** Render sets `NODE_ENV=production` before the build, which makes pnpm skip `devDependencies` (including `turbo`). Fixed by:
>
> 1. `.npmrc` → `production=false` (applies globally, regardless of build command)
> 2. Both build commands also pass `--prod=false` as belt-and-suspenders

**Turbo Version on Render:** 2.8.14 (resolved from `^2.5.2` in root `package.json`)

### Password Reset Mail

- Backend password reset emails are sent by `apps/backend/src/modules/mail/mail.service.ts` using Nodemailer.
- `apps/backend/src/modules/auth/auth.service.ts` generates the reset token, stores the hashed token in Redis for 1 hour, and builds the email link from `WEB_APP_URL`.
- In non-production, forgot-password still exposes `userId`, `token`, and `resetUrl` when `AUTH_EXPOSE_RESET_TOKEN=true` or `NODE_ENV!=production`.
- Brevo is supported via either canonical SMTP vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) or Brevo aliases (`SMTP_BREVO_LOGIN`, `SMTP_BREVO_API_KEY`).
- Brevo relay settings: host `smtp-relay.brevo.com`, port `587`, `SMTP_SECURE=false`.
- `MAIL_FROM` must be a verified Brevo sender/domain for delivery to succeed.

### EAS Build Profiles
```
development → Internal distribution, debug APK
preview     → Internal distribution, release APK
production  → Store distribution, release APK, auto-increment version
```

---

## 12. Key Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `ListingCard.tsx`)
- Hooks: `camelCase.ts`, prefix `use` (e.g., `useListings.ts`)
- Services: `camelCase.service.ts` (e.g., `auth.service.ts`)
- Stores: `camelCase.store.ts` (e.g., `auth.store.ts`)
- Types: `camelCase.types.ts` (e.g., `user.types.ts`)
- API modules: `camelCase.api.ts` (e.g., `listings.api.ts`)

### Import Aliases
```typescript
@jefflink/types    → packages/types/src
@jefflink/api      → packages/api/src
@jefflink/auth     → packages/auth/src
@jefflink/ui       → packages/ui/src
@jefflink/utils    → packages/utils/src
@jefflink/design-tokens → packages/design-tokens/src
```

### API Response Shape
```typescript
// All backend responses
{ success: true, data: T }
{ success: false, error: string, statusCode: number }
```

### Pagination
```typescript
// Query: GET /listings?page=0&limit=20&sort=createdAt
PaginationDto { page: number, limit: number, sort?: string }
// Response: { data: T[], total: number, page: number, pages: number }
```

### Auth Headers
```http
Authorization: Bearer {accessToken}
```

### Role Guards (Backend)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Get('/admin/users')
```

### Role Guards (Mobile)
```typescript
<RoleGuard allowedRoles={['VENDOR', 'ADMIN']}>
  <VendorOnlyComponent />
</RoleGuard>
```

---

## 13. Update Log

| Date | Change | Updated By |
|------|--------|-----------|
| 2026-03-12 | Initial knowledge bank created | Copilot |
| 2026-03-13 | `@jefflink/design-tokens` — added `shadows.ts` (CSS + RN elevation) and `breakpoints.ts` (JS numeric values); updated `index.ts` barrel | Copilot |
| 2026-03-13 | `@jefflink/ui` — expanded from 4 to 20 components: Input, Select, SearchBar, Card, PriceTag, Avatar, ListingCard, VendorCard, ListingGrid, FilterPanel, ImageGallery, Modal, Tabs, Pagination, FavoriteButton, ActionBar, MapView, Toast; all dual `.native.tsx` + `.web.tsx`; barrel `index.ts` updated | Copilot |
| 2026-03-14 | `.npmrc` — added `production=false` so pnpm installs devDependencies (including `turbo`) even when `NODE_ENV=production` on Render | Copilot |
| 2026-03-14 | `render.yaml` — added `--prod=false` to both `pnpm install` build commands (belt-and-suspenders alongside `.npmrc` fix) | Copilot |
| 2026-03-14 | `apps/web/app/houses/page.tsx` + `apps/web/app/land/page.tsx` — switched from `revalidate=60` (ISR, causes 60s build timeout against cold Render API) to `force-dynamic` + `cache:'no-store'`; build now completes in ~22s | Copilot |
| 2026-03-14 | § 7 Web App fully documented: all 21 routes with rendering strategy, full directory tree, updated Next.js version (15.5.12) | Copilot |
| 2026-03-14 | § 11 Deployment — updated Render services table (names, URLs, build cmds), DNS CNAMEs, R2 storage note, pnpm+Render gotcha documented | Copilot |
| 2026-03-15 | **Admin Infrastructure wired to Neon DB** — (1) Drizzle migration `0001_admin_infrastructure.sql` registered in journal + run against Neon (`npm run db:migrate:admin`); (2) 3 new DB tables: `vendor_profiles`, `listing_reports`, `admin_logs`; (3) 6 NestJS admin services fully wired to Neon: `AdminAnalyticsService`, `AdminUsersService`, `AdminListingsService`, `AdminVendorsService`, `AdminFinanceService`, `AuditLogService`; (4) Mobile `endpoints.ts` expanded to 34 admin routes; (5) `admin.api.ts` rewritten with 20 typed methods; (6) All 5 admin mobile screens wired to live Neon data: `DashboardScreen`, `UsersScreen`, `ContractsScreen`, `PaymentsScreen`, `MonitorSyncScreen` | Copilot |
| 2026-03-15 | **R2 Media & CMS Architecture** — (1) `storage.config.ts` fixed: key names unified to match `media.service.ts` (`accountId`, `bucket`, `publicUrl`); default bucket name set to `jefflink-storage`; AWS S3 config removed. (2) `media.service.ts` — added `presignUpload(path, contentType)`: generates 5-min presigned R2 PUT URL so clients upload directly to R2 (zero backend bandwidth). (3) `media.controller.ts` — added `POST /api/v1/media/presign` endpoint. (4) `media_assets` schema — added `status VARCHAR(20) DEFAULT 'ACTIVE'` column. (5) New CMS DB tables: `cms_sliders`, `cms_banners`, `cms_content` (§ 5.3). (6) New NestJS `CmsModule` (`apps/backend/src/modules/cms/`) with `CmsService` + `CmsController` + DTOs. (7) Public endpoint `GET /api/v1/cms/homepage` returns sliders + banners + content map in one call. (8) Admin CRUD endpoints for sliders and content blocks (ADMIN/SYSTEM_ADMIN roles). (9) Drizzle migration `0002_cms_media_architecture.sql` added with seed data. (10) `.env.example` updated with all 5 `R2_*` vars and bucket folder structure. (11) `apps/web/app/commercial/[id]/page.tsx` — `fallbackIcon` fixed: import `BriefcaseBusiness` from `lucide-react` and pass as component reference instead of string. | Copilot |
| 2026-03-20 | `apps/backend` — added SMTP-backed `MailService`, wired `/auth/forgot-password` to send reset emails, and documented required `SMTP_*` / `MAIL_*` environment variables. | Copilot |
| 2026-03-20 | `apps/backend` — updated current mailer state to reflect Brevo relay support (`SMTP_BREVO_LOGIN`, `SMTP_BREVO_API_KEY`), `WEB_APP_URL`-based reset links, and Render-ready SMTP settings (`smtp-relay.brevo.com:587`, `SMTP_SECURE=false`). | Copilot |
| 2026-03-20 | `render.yaml` + § 11 Deployment — appended a short production Render env checklist covering required secrets, fixed values, and post-change drift checks for the cloud-only stack. | Copilot |

---

> **How to keep this updated:**
> After any of these changes, update the relevant section above and add an entry to the Update Log:
> - New feature module added
> - New API endpoint
> - Schema migration
> - New shared package
> - Navigation route added or changed
> - Environment variable added
> - Deployment config changed
