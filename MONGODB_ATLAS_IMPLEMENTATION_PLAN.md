# JeffLink MongoDB Atlas Implementation Plan

## Status

- Document type: implementation plan
- Scope: monorepo-wide
- State: planned architecture, not yet implemented
- Date: 2026-03-21

## 1. Objective

Introduce MongoDB Atlas into the JeffLink monorepo as the system of record for non-financial, document-heavy, and high-write workloads while preserving Neon PostgreSQL as the financial and transactional source of truth.

Atlas will own:

- CMS page definitions and dynamic layout content
- GPS telemetry and latest-location state
- File and document metadata
- High-volume activity logs
- Non-financial real-time event materialization

Neon will continue to own:

- Users and RBAC
- Listings, vendors, subscriptions, and contracts
- Wallets, payments, and ledger workflows
- Any approval or state transition with financial consequences

## 2. Current Monorepo Baseline

Current backend modules already present:

- `apps/backend/src/modules/cms`
- `apps/backend/src/modules/media`
- `apps/backend/src/modules/auth`
- `apps/backend/src/modules/users`
- `apps/backend/src/modules/cars`
- `apps/backend/src/modules/properties`
- `apps/backend/src/modules/transactions`
- `apps/backend/src/modules/wallet`
- `apps/backend/src/modules/admin`

Current production storage already present:

- Neon PostgreSQL for business data
- Redis for cache and queue coordination
- Cloudflare R2 for binary storage

Current gaps:

- No MongoDB driver or module wiring in `apps/backend`
- No GPS backend implementation
- Mobile GPS service is still a placeholder
- CMS is still SQL-backed via Drizzle tables

## 3. Implementation Principles

- Mobile and web never connect directly to Atlas.
- Atlas stores documents and metadata, not financial truth.
- Cloudflare R2 stores binaries; Atlas stores references and metadata.
- All Atlas writes go through NestJS validation and RBAC.
- Cross-database relationships use Neon UUIDs as foreign references.
- Redis caches read models, never raw binary content.
- CMS rollout must preserve the current SQL-backed CMS as fallback until cutover is complete.

## 4. Required Package Changes

Add backend dependencies in `apps/backend/package.json`:

- `mongodb`
- `zod`

Optional future package if change streams are pushed to websockets or SSE workers:

- `eventemitter3`

Do not add Mongoose in phase 1. Use the official MongoDB driver plus Atlas collection validators to keep the document model flexible and avoid introducing an ODM layer that duplicates DTO validation.

## 5. Backend Module Plan

### 5.1 Infrastructure Layer

Add:

- `apps/backend/src/config/mongo.config.ts`
- `apps/backend/src/mongo/mongo.constants.ts`
- `apps/backend/src/mongo/mongo.module.ts`
- `apps/backend/src/mongo/mongo.service.ts`
- `apps/backend/src/mongo/mongo.health.ts`

Responsibilities:

- Parse `MONGO_URI`, database name, and collection names
- Create a singleton Mongo client
- Expose typed collection accessors
- Register shutdown hooks
- Provide a health check for Atlas connectivity

### 5.2 CMS Module Refactor

Keep the existing `apps/backend/src/modules/cms` module name so current clients do not break.

Refactor module structure to:

- `apps/backend/src/modules/cms/cms.module.ts`
- `apps/backend/src/modules/cms/cms-public.controller.ts`
- `apps/backend/src/modules/cms/cms-admin.controller.ts`
- `apps/backend/src/modules/cms/cms.service.ts`
- `apps/backend/src/modules/cms/cms.facade.ts`
- `apps/backend/src/modules/cms/stores/cms-store.interface.ts`
- `apps/backend/src/modules/cms/stores/cms-neon.store.ts`
- `apps/backend/src/modules/cms/stores/cms-atlas.store.ts`
- `apps/backend/src/modules/cms/dto/create-cms-page.dto.ts`
- `apps/backend/src/modules/cms/dto/update-cms-page.dto.ts`
- `apps/backend/src/modules/cms/dto/publish-cms-page.dto.ts`
- `apps/backend/src/modules/cms/dto/reorder-cms-sections.dto.ts`
- `apps/backend/src/modules/cms/dto/upsert-cms-navigation.dto.ts`
- `apps/backend/src/modules/cms/dto/update-cms-settings.dto.ts`
- `apps/backend/src/modules/cms/dto/query-cms-page.dto.ts`
- `apps/backend/src/modules/cms/serializers/cms-response.serializer.ts`
- `apps/backend/src/modules/cms/constants/section-types.ts`

Responsibilities:

- Public page retrieval for web and mobile
- Admin page creation, editing, publishing, and archiving
- Navigation and settings retrieval
- Fallback switching between Neon-backed legacy store and Atlas-backed store using feature flags
- Cache invalidation after publish operations

### 5.3 GPS Module

Add:

- `apps/backend/src/modules/gps/gps.module.ts`
- `apps/backend/src/modules/gps/gps-public.controller.ts`
- `apps/backend/src/modules/gps/gps-admin.controller.ts`
- `apps/backend/src/modules/gps/gps-ingest.controller.ts`
- `apps/backend/src/modules/gps/gps.service.ts`
- `apps/backend/src/modules/gps/gps-alert.service.ts`
- `apps/backend/src/modules/gps/gps-geofence.service.ts`
- `apps/backend/src/modules/gps/dto/ingest-gps-ping.dto.ts`
- `apps/backend/src/modules/gps/dto/query-gps-history.dto.ts`
- `apps/backend/src/modules/gps/dto/create-geofence.dto.ts`
- `apps/backend/src/modules/gps/dto/update-geofence.dto.ts`
- `apps/backend/src/modules/gps/dto/acknowledge-gps-alert.dto.ts`
- `apps/backend/src/modules/gps/dto/register-device.dto.ts`
- `apps/backend/src/modules/gps/types/gps.types.ts`

Responsibilities:

- Device ingestion endpoint for tracker payloads
- Latest vehicle location read model
- Historical route queries
- Geofence rule management
- Speed and ignition alert generation
- Device registration and health tracking

### 5.4 Documents Module

Add:

- `apps/backend/src/modules/documents/documents.module.ts`
- `apps/backend/src/modules/documents/documents.controller.ts`
- `apps/backend/src/modules/documents/documents-admin.controller.ts`
- `apps/backend/src/modules/documents/documents.service.ts`
- `apps/backend/src/modules/documents/dto/create-document-record.dto.ts`
- `apps/backend/src/modules/documents/dto/query-document-assets.dto.ts`
- `apps/backend/src/modules/documents/dto/update-document-status.dto.ts`

Responsibilities:

- Store metadata for KYC uploads, listing media bundles, brochures, and non-financial attachments
- Link Atlas document metadata to R2 object keys and public URLs
- Support reference lookups by `referenceType` and `referenceId`

### 5.5 Activity Module

Add:

- `apps/backend/src/modules/activity/activity.module.ts`
- `apps/backend/src/modules/activity/activity.controller.ts`
- `apps/backend/src/modules/activity/activity.service.ts`
- `apps/backend/src/modules/activity/dto/write-activity-log.dto.ts`
- `apps/backend/src/modules/activity/dto/query-activity-log.dto.ts`

Responsibilities:

- Persist non-financial activity logs
- Query user and admin activity streams
- TTL-manage lower-value logs

### 5.6 Realtime Module

Add:

- `apps/backend/src/modules/realtime/realtime.module.ts`
- `apps/backend/src/modules/realtime/realtime.gateway.ts`
- `apps/backend/src/modules/realtime/realtime.service.ts`
- `apps/backend/src/modules/realtime/dto/publish-realtime-event.dto.ts`

Responsibilities:

- Publish CMS refresh events
- Push latest GPS updates to subscribed clients
- Surface non-financial alerts and notifications

## 6. Shared Package Changes

### `packages/types`

Add:

- `packages/types/src/cms.ts`
- `packages/types/src/gps.ts`
- `packages/types/src/documents.ts`
- `packages/types/src/activity.ts`
- `packages/types/src/index.ts` updates

Export types such as:

- `CmsPage`
- `CmsSection`
- `CmsNavigation`
- `CmsSettings`
- `GpsLatestPosition`
- `GpsHistoryPoint`
- `GpsAlert`
- `DeviceRegistryRecord`
- `DocumentAsset`
- `ActivityLogEntry`

### `packages/api`

Add:

- `packages/api/src/cms.ts`
- `packages/api/src/gps.ts`
- `packages/api/src/documents.ts`
- `packages/api/src/activity.ts`
- `packages/api/src/index.ts` updates

### Mobile feature modules

Add or complete:

- `apps/mobile/src/features/cms/service.ts`
- `apps/mobile/src/features/cms/hooks.ts`
- `apps/mobile/src/features/gps/service.ts`
- `apps/mobile/src/features/gps/hooks.ts`
- `apps/mobile/src/features/documents/service.ts`

### Web data access

Add:

- `apps/web/src/lib/cms.ts`
- `apps/web/src/lib/gps.ts`

## 7. Atlas Collections

## 7.1 CMS Collections

### `cms_pages`

Purpose:

- Primary headless CMS page store for mobile and web

Document shape:

- `_id`
- `slug`
- `platform` as `ALL | MOBILE | WEB`
- `locale`
- `title`
- `status` as `DRAFT | PUBLISHED | ARCHIVED`
- `version`
- `layout.header`
- `layout.slider`
- `layout.body`
- `layout.lists`
- `seo.title`
- `seo.description`
- `seo.imageUrl`
- `publishedAt`
- `updatedAt`
- `updatedBy`

Indexes:

- unique index on `slug + platform + locale + version`
- index on `slug + platform + locale + status`
- index on `updatedAt`
- index on `publishedAt`

### `cms_page_revisions`

Purpose:

- Immutable version history for rollback and audit

Document shape:

- `_id`
- `pageId`
- `slug`
- `version`
- `snapshot`
- `createdAt`
- `createdBy`

Indexes:

- unique index on `pageId + version`
- index on `slug + version`

### `cms_navigation`

Purpose:

- Navigation trees by platform and location

Document shape:

- `_id`
- `key`
- `platform`
- `items[]`
- `status`
- `updatedAt`
- `updatedBy`

Indexes:

- unique index on `key + platform`

### `cms_settings`

Purpose:

- Global content settings and non-financial feature toggles

Document shape:

- `_id`
- `appName`
- `supportEmail`
- `contactPhone`
- `currencyDisplay`
- `features.enableHirePurchaseContent`
- `features.enableGPSContent`
- `features.enableMarketplaceContent`
- `updatedAt`
- `updatedBy`

Indexes:

- unique index on `_id`

### `cms_media_refs`

Purpose:

- Map CMS blocks to R2 assets and metadata

Document shape:

- `_id`
- `ownerType`
- `ownerId`
- `assetType`
- `url`
- `key`
- `alt`
- `mimeType`
- `sizeBytes`
- `status`
- `createdAt`

Indexes:

- index on `ownerType + ownerId`
- index on `createdAt`

## 7.2 GPS Collections

### `gps_logs`

Purpose:

- Append-only telemetry history

Document shape:

- `_id`
- `vehicleId`
- `deviceId`
- `contractId`
- `location.type`
- `location.coordinates`
- `speedKph`
- `ignition`
- `heading`
- `batteryVoltage`
- `provider`
- `recordedAt`
- `receivedAt`
- `rawPayload`

Indexes:

- `2dsphere` on `location`
- compound index on `vehicleId + recordedAt`
- compound index on `deviceId + recordedAt`
- TTL index on `receivedAt` only if raw retention policy is enabled for expiring low-value payloads

### `gps_latest`

Purpose:

- One-record-per-vehicle latest snapshot for fast reads

Document shape:

- `_id`
- `vehicleId`
- `deviceId`
- `location`
- `speedKph`
- `ignition`
- `recordedAt`
- `stale`
- `lastAlertType`
- `updatedAt`

Indexes:

- unique index on `vehicleId`
- index on `updatedAt`

### `device_registry`

Purpose:

- Tracker assignment and operational metadata

Document shape:

- `_id`
- `deviceId`
- `vehicleId`
- `vendorId`
- `firmwareVersion`
- `simNumber`
- `status`
- `lastHeartbeatAt`
- `installedAt`

Indexes:

- unique index on `deviceId`
- unique sparse index on `vehicleId`

### `geofences`

Purpose:

- Geofence definitions for alerts and monitoring

Document shape:

- `_id`
- `name`
- `scopeType`
- `scopeId`
- `geometry`
- `radiusMeters`
- `ruleType`
- `active`
- `createdAt`
- `updatedAt`

Indexes:

- `2dsphere` on `geometry`
- index on `scopeType + scopeId + active`

### `gps_alerts`

Purpose:

- Derived non-financial alert stream

Document shape:

- `_id`
- `vehicleId`
- `deviceId`
- `alertType`
- `severity`
- `message`
- `context`
- `createdAt`
- `acknowledgedAt`
- `acknowledgedBy`

Indexes:

- index on `vehicleId + createdAt`
- index on `alertType + createdAt`
- index on `acknowledgedAt`

## 7.3 Supporting Non-Financial Collections

### `document_assets`

Purpose:

- File metadata only; binaries remain in R2

Document shape:

- `_id`
- `referenceType`
- `referenceId`
- `ownerId`
- `assetType`
- `bucket`
- `key`
- `url`
- `mimeType`
- `sizeBytes`
- `checksum`
- `status`
- `uploadedAt`

Indexes:

- index on `referenceType + referenceId`
- index on `ownerId + uploadedAt`

### `activity_logs`

Purpose:

- High-volume user and admin activity tracking

Document shape:

- `_id`
- `userId`
- `actorRole`
- `action`
- `device`
- `ip`
- `metadata`
- `createdAt`

Indexes:

- index on `userId + createdAt`
- index on `action + createdAt`
- TTL index on `createdAt` for low-value retention windows if enabled

### `notification_events`

Purpose:

- Materialized, non-financial event stream for realtime delivery

Document shape:

- `_id`
- `eventType`
- `scopeType`
- `scopeId`
- `payload`
- `createdAt`
- `consumedAt`

Indexes:

- index on `eventType + createdAt`
- index on `scopeType + scopeId + createdAt`

## 8. DTO Specification

## 8.1 CMS DTOs

### `CreateCmsPageDto`

- `slug: string`
- `platform: 'ALL' | 'MOBILE' | 'WEB'`
- `locale: string`
- `title: string`
- `layout: CmsLayoutDto`
- `seo?: CmsSeoDto`
- `status?: 'DRAFT' | 'PUBLISHED'`

### `UpdateCmsPageDto`

- all `CreateCmsPageDto` fields optional
- `expectedVersion?: number`

### `PublishCmsPageDto`

- `status: 'PUBLISHED' | 'ARCHIVED'`
- `publishAt?: string`

### `ReorderCmsSectionsDto`

- `sectionIds: string[]`

### `UpsertCmsNavigationDto`

- `key: string`
- `platform: 'ALL' | 'MOBILE' | 'WEB'`
- `items: CmsNavigationItemDto[]`

### `UpdateCmsSettingsDto`

- `appName?: string`
- `supportEmail?: string`
- `contactPhone?: string`
- `currencyDisplay?: string`
- `features?: Record<string, boolean>`

### `QueryCmsPageDto`

- `platform?: 'ALL' | 'MOBILE' | 'WEB'`
- `locale?: string`
- `preview?: boolean`

## 8.2 GPS DTOs

### `IngestGpsPingDto`

- `deviceId: string`
- `vehicleId: string`
- `contractId?: string`
- `longitude: number`
- `latitude: number`
- `speedKph?: number`
- `ignition?: boolean`
- `heading?: number`
- `batteryVoltage?: number`
- `recordedAt: string`
- `provider?: string`
- `rawPayload?: Record<string, unknown>`

### `QueryGpsHistoryDto`

- `start: string`
- `end: string`
- `limit?: number`

### `CreateGeofenceDto`

- `name: string`
- `scopeType: 'VEHICLE' | 'VENDOR' | 'FLEET'`
- `scopeId: string`
- `geometry: GeoJsonDto`
- `radiusMeters?: number`
- `ruleType: 'ENTRY' | 'EXIT' | 'BOTH'`

### `UpdateGeofenceDto`

- all `CreateGeofenceDto` fields optional
- `active?: boolean`

### `AcknowledgeGpsAlertDto`

- `alertIds: string[]`

### `RegisterDeviceDto`

- `deviceId: string`
- `vehicleId: string`
- `vendorId?: string`
- `firmwareVersion?: string`
- `simNumber?: string`

## 8.3 Document DTOs

### `CreateDocumentRecordDto`

- `referenceType: string`
- `referenceId: string`
- `assetType: string`
- `bucket: string`
- `key: string`
- `url: string`
- `mimeType: string`
- `sizeBytes: number`
- `checksum?: string`

### `QueryDocumentAssetsDto`

- `referenceType: string`
- `referenceId: string`

### `UpdateDocumentStatusDto`

- `status: 'ACTIVE' | 'DELETED' | 'QUARANTINED'`

## 8.4 Activity DTOs

### `WriteActivityLogDto`

- `userId: string`
- `actorRole: string`
- `action: string`
- `device?: string`
- `ip?: string`
- `metadata?: Record<string, unknown>`

### `QueryActivityLogDto`

- `userId?: string`
- `action?: string`
- `start?: string`
- `end?: string`
- `limit?: number`

## 9. Endpoint Plan

All endpoints stay under `/api/v1`.

## 9.1 Public CMS Endpoints

- `GET /cms/page/:slug`
- `GET /cms/page/:slug/revisions`
- `GET /cms/navigation/:key`
- `GET /cms/settings`

Query parameters:

- `platform=ALL|MOBILE|WEB`
- `locale=en|sw|...`
- `preview=true|false`

## 9.2 Admin CMS Endpoints

- `POST /admin/cms/pages`
- `PATCH /admin/cms/pages/:id`
- `POST /admin/cms/pages/:id/publish`
- `POST /admin/cms/pages/:id/archive`
- `POST /admin/cms/pages/:id/reorder-sections`
- `GET /admin/cms/pages`
- `GET /admin/cms/pages/:id`
- `DELETE /admin/cms/pages/:id`
- `PUT /admin/cms/navigation/:key`
- `PUT /admin/cms/settings`

## 9.3 Public GPS Endpoints

- `GET /gps/vehicles/:vehicleId/latest`
- `GET /gps/vehicles/:vehicleId/history`
- `GET /gps/vehicles/:vehicleId/alerts`

## 9.4 Admin GPS Endpoints

- `POST /admin/gps/devices`
- `PATCH /admin/gps/devices/:deviceId`
- `POST /admin/gps/geofences`
- `PATCH /admin/gps/geofences/:id`
- `GET /admin/gps/geofences`
- `POST /admin/gps/alerts/acknowledge`
- `GET /admin/gps/devices`

## 9.5 Ingest Endpoints

- `POST /gps/ingest/ping`
- `POST /gps/ingest/heartbeat`

These endpoints use a device secret or signed gateway token, not user JWT auth.

## 9.6 Document Endpoints

- `GET /documents`
- `POST /documents`
- `PATCH /documents/:id/status`

Recommended query format:

- `GET /documents?referenceType=LISTING&referenceId=<uuid>`

## 9.7 Activity Endpoints

- `GET /activity/me`
- `GET /admin/activity`
- `POST /internal/activity`

## 10. Environment Variables

Add to `.env.example` and deployment environments:

- `MONGO_URI=`
- `MONGO_DB_NAME=jefflink`
- `MONGO_APP_NAME=jefflink-api`
- `MONGO_CMS_PAGES_COLLECTION=cms_pages`
- `MONGO_GPS_LOGS_COLLECTION=gps_logs`
- `MONGO_GPS_LATEST_COLLECTION=gps_latest`
- `MONGO_DOCUMENT_ASSETS_COLLECTION=document_assets`
- `MONGO_ACTIVITY_LOGS_COLLECTION=activity_logs`
- `MONGO_NOTIFICATION_EVENTS_COLLECTION=notification_events`
- `CMS_ATLAS_ENABLED=false`
- `GPS_ATLAS_ENABLED=false`
- `DOCUMENTS_ATLAS_ENABLED=false`

## 11. Caching Plan

Redis keys:

- `cms:page:{slug}:{platform}:{locale}`
- `cms:navigation:{key}:{platform}`
- `cms:settings:global`
- `gps:latest:vehicle:{vehicleId}`

Invalidation rules:

- CMS publish, archive, update, and navigation changes delete related `cms:*` keys
- GPS latest updates overwrite a single latest-location key per vehicle
- Historical GPS queries are not cached in phase 1

## 12. Rollout Phases

## Phase 0: Foundation

Deliverables:

- Add Mongo config and client module
- Add health check
- Add env vars to `.env.example`
- Add feature flags for Atlas-backed modules

Acceptance criteria:

- Backend starts with Atlas enabled or disabled
- `/health` reports Atlas dependency status when enabled
- No existing CMS endpoints break

## Phase 1: CMS Data Layer

Deliverables:

- Implement `cms-atlas.store.ts`
- Keep `cms-neon.store.ts` as fallback
- Introduce Atlas `cms_pages`, `cms_page_revisions`, `cms_navigation`, `cms_settings`, `cms_media_refs`
- Build admin CRUD endpoints for pages, navigation, and settings

Acceptance criteria:

- Existing public CMS consumers can switch to Atlas via feature flag
- Admin can create and publish a page without direct DB access
- Redis invalidation works on publish

## Phase 2: Web CMS Rendering

Deliverables:

- Add `apps/web/src/lib/cms.ts`
- Replace homepage-local assembly with CMS payload-driven rendering
- Add section renderer registry for web

Acceptance criteria:

- Home page, nav, and marketing sections render from CMS payloads
- No redeploy needed for content changes
- Listing feeds still resolve from Neon-backed endpoints

## Phase 3: Mobile CMS Rendering

Deliverables:

- Add `apps/mobile/src/features/cms/*`
- Add screen-level section renderers for mobile
- Use CMS payloads for dynamic home sections and banners

Acceptance criteria:

- Mobile home screen content updates through CMS publish flow
- Platform-specific sections honor `platform` targeting

## Phase 4: GPS Backend

Deliverables:

- Add GPS module and Atlas collections
- Add ingest endpoints, latest-location reads, history reads, alerts, and device registry
- Complete the mobile GPS feature service

Acceptance criteria:

- Devices can ingest location payloads
- Customer app can fetch latest location and history
- Alerts are stored without changing financial state

## Phase 5: Documents and Activity

Deliverables:

- Add `document_assets` and `activity_logs`
- Support KYC and listing-media metadata in Atlas with R2 references
- Add admin activity queries

Acceptance criteria:

- File metadata is queryable by business reference
- High-volume activity logs no longer rely on Neon tables

## Phase 6: Realtime and Cutover

Deliverables:

- Add realtime delivery for CMS refresh events and GPS updates
- Enable change-stream-driven internal fan-out where appropriate
- Switch production feature flags to Atlas for CMS and GPS
- Freeze legacy SQL CMS writes

Acceptance criteria:

- Atlas-backed CMS is the active source for content
- GPS module is live for mobile and admin users
- Legacy SQL CMS remains readable for rollback window only

## 13. Cutover and Rollback Strategy

Cutover steps:

- Backfill CMS documents from SQL CMS tables into Atlas
- Verify page parity in staging
- Enable `CMS_ATLAS_ENABLED=true` in staging
- Promote to production
- Keep SQL CMS reads available for rollback for one release window

Rollback steps:

- Disable Atlas feature flags
- Revert CMS reads to `cms-neon.store.ts`
- Keep Atlas data for replay and verification

GPS rollback is simpler because it is net-new:

- Disable public GPS reads
- Stop ingest endpoint routing
- Keep Atlas data retained for replay

## 14. Non-Goals

- Do not move payments, wallet balances, contracts, or ledger entries to Atlas.
- Do not store images or documents as Mongo binary blobs.
- Do not expose Atlas directly to mobile or web.
- Do not replace Neon listing APIs with Atlas copies.

## 15. First Implementation Slice

The recommended first delivery batch is:

- Mongo infrastructure layer
- Feature flags
- Atlas-backed CMS collections
- Admin CMS endpoints
- Public CMS read endpoints with Redis cache

This slice is the safest because it delivers visible business value without touching financial state or introducing tracker-ingest complexity.

## 16. Atlas Cluster Configuration

### Tier and Region

- Cluster tier: M10 (development/staging), M30+ (production)
- Region: same as Render deployment region to minimize cross-region latency
- Replication: default 3-node replica set (built into Atlas)
- Read preference: `primaryPreferred` for writes and reads that require consistency; `secondaryPreferred` for GPS history and activity log queries where eventual consistency is acceptable

### Connection Settings

- Use SRV connection string format (`mongodb+srv://`)
- Enable `retryWrites=true` and `retryReads=true`
- Set `maxPoolSize=20` for development, `maxPoolSize=50` for production
- Set `connectTimeoutMS=10000` and `serverSelectionTimeoutMS=5000`
- Enable `compressors=zstd` for wire compression between Render and Atlas

### Sharding

- No sharding in phase 1 through phase 4
- Evaluate shard key on `vehicleId` for `gps_logs` collection only if write volume exceeds single-node throughput

### Atlas Search

- Not required in phase 1
- If full-text search is needed for CMS pages or activity logs, create Atlas Search indexes rather than introducing a separate Elasticsearch dependency

## 17. Security and Access Control

### Network Access

- Atlas IP access list restricted to Render outbound IPs and developer VPN CIDR ranges
- No `0.0.0.0/0` access allowed in staging or production
- Use Atlas Network Peering or Private Endpoints if the Render deployment region supports it

### Authentication

- Create a dedicated Atlas database user per environment (`jefflink-api-dev`, `jefflink-api-staging`, `jefflink-api-prod`)
- Use SCRAM-SHA-256 authentication
- Store credentials in Render environment groups, never in source control
- Rotate Atlas credentials on a quarterly cycle

### Encryption

- Encryption at rest: enabled via Atlas default (AWS KMS or Azure Key Vault depending on cluster region)
- Encryption in transit: enforced via TLS 1.2+ on all connections (Atlas default)
- No client-side field-level encryption in phase 1; evaluate for PII fields in `activity_logs` if regulatory requirements emerge

### RBAC Mapping per Endpoint Group

| Endpoint group | Required role(s) | Guard chain |
| --- | --- | --- |
| Public CMS reads | None (public) | `@Public()` |
| Admin CMS writes | `SYSTEM_ADMIN`, `DIRECTOR`, `MANAGER` | `JwtAuthGuard` → `AdminGuard` → `RolesGuard` |
| Public GPS reads | `CUSTOMER`, `VENDOR`, `ADMIN` | `JwtAuthGuard` → `RolesGuard` |
| Admin GPS writes | `SYSTEM_ADMIN`, `DIRECTOR` | `JwtAuthGuard` → `AdminGuard` → `RolesGuard` |
| GPS ingest | Device token (not user JWT) | Custom `DeviceTokenGuard` |
| Document endpoints | Authenticated user + ownership check | `JwtAuthGuard` → `RolesGuard` + ownership interceptor |
| Activity reads | Self for `/activity/me`; admin for `/admin/activity` | `JwtAuthGuard` → `RolesGuard` |
| Internal activity writes | Internal service token only | `InternalServiceGuard` |

### Rate Limiting

- GPS ingest endpoint: separate throttle profile (`THROTTLE_GPS_TTL=10000`, `THROTTLE_GPS_LIMIT=100`) to accommodate high-frequency device pings without affecting user-facing rate limits
- All other Atlas-backed endpoints inherit the global throttle configuration (`THROTTLE_TTL`, `THROTTLE_LIMIT`)

## 18. Testing Strategy

### Unit Tests

- Follow existing Jest configuration (`*.spec.ts` in `apps/backend/src`)
- Mock `MongoService` collection accessors in unit tests for all Atlas-backed services
- Test DTO validation using `class-validator` and `class-transformer` directly
- Test CMS facade store-switching logic with both Atlas and Neon store mocks

Example test file structure:

- `apps/backend/src/mongo/mongo.service.spec.ts`
- `apps/backend/src/modules/cms/cms.facade.spec.ts`
- `apps/backend/src/modules/cms/stores/cms-atlas.store.spec.ts`
- `apps/backend/src/modules/gps/gps.service.spec.ts`
- `apps/backend/src/modules/gps/gps-geofence.service.spec.ts`
- `apps/backend/src/modules/documents/documents.service.spec.ts`
- `apps/backend/src/modules/activity/activity.service.spec.ts`

### Integration Tests

- Use `mongodb-memory-server` for in-memory Atlas-compatible testing
- Create a `test/helpers/mongo-test.module.ts` that provides an in-memory Mongo instance
- Integration tests verify collection creation, index enforcement, and query correctness
- Test the CMS fallback path: Atlas store → Neon store when `CMS_ATLAS_ENABLED=false`

### End-to-End Tests

- E2E tests use supertest against the running NestJS app with an in-memory Mongo backend
- Cover the full request → guard → service → store → response pipeline for each endpoint group
- GPS ingest E2E: send a ping payload, verify `gps_logs` insert, verify `gps_latest` upsert, verify Redis cache update

### Test Data Seeding

- Create `test/fixtures/cms-pages.fixture.ts` with sample page documents
- Create `test/fixtures/gps-pings.fixture.ts` with sample telemetry payloads
- Create `test/fixtures/geofences.fixture.ts` with sample geofence geometries
- Fixtures use factory functions, not static JSON, to allow per-test customization

## 19. Monitoring and Observability

### Structured Logging

- All Atlas-backed services use the existing `nestjs-pino` logger
- Log Atlas operation durations at `debug` level in development and `info` level in production
- Redact `MONGO_URI` credentials from all log output (add to Pino `redact` array)
- Include `collection`, `operation`, and `durationMs` fields in structured log entries for Atlas calls

### Sentry Integration

- Capture Atlas connection failures and query timeouts as Sentry exceptions
- Tag Atlas errors with `service:mongo`, `collection:<name>`, and `operation:<type>`
- Do not capture individual GPS ingest failures as Sentry events to avoid alert fatigue; aggregate them into a counter metric instead

### Health Checks

- Add `MongoHealthIndicator` to the existing Terminus health module alongside `DatabaseHealthIndicator` and `RedisHealthIndicator`
- Health check runs `db.runCommand({ ping: 1 })` against Atlas
- Expose Atlas status in the existing `/health` endpoint response

### Atlas Monitoring

- Enable Atlas built-in monitoring for:
  - Operation latency (P50, P95, P99) per collection
  - Connection pool utilization
  - Opcounters (insert, query, update, delete rates)
  - Disk IOPS and storage size
- Set Atlas alerts for:
  - Replication lag exceeding 10 seconds
  - Connection pool utilization exceeding 80%
  - Query targeting ratio exceeding 1000 (indicates missing index)
  - Disk usage exceeding 80% of provisioned storage

### Custom Metrics

- Expose GPS ingest throughput as a gauge metric: pings received per 10-second window
- Expose CMS cache hit ratio: Redis hits versus Atlas reads per minute
- Use Render's built-in metrics dashboard or push to an external time-series store if required

## 20. Data Migration

### CMS SQL to Atlas Migration

Migration runs as a one-time NestJS CLI command, not as a Drizzle migration.

Steps:

1. Create `apps/backend/src/scripts/migrate-cms-to-atlas.ts`
2. Read all rows from Drizzle tables: `cmsSliders`, `cmsBanners`, `cmsContent`
3. Transform each row into the `cms_pages` document shape, mapping:
   - Each slider row → a section in `layout.slider`
   - Each banner row → a section in `layout.header`
   - Each content block row → a section in `layout.body`
4. Composite a single `homepage` page document from the existing content
5. Create additional page documents for each unique CMS content slug
6. Insert into Atlas `cms_pages` collection
7. Insert corresponding revision into `cms_page_revisions` with `version: 1`
8. Log migration summary: total rows read, documents created, errors encountered

### Verification

- Run the migration in staging first
- Compare rendered homepage output between SQL-backed and Atlas-backed CMS reads
- Automated comparison script: fetch `/cms/page/homepage` with `CMS_ATLAS_ENABLED=false`, fetch again with `CMS_ATLAS_ENABLED=true`, diff the response payloads

### GPS Migration

- No migration needed; GPS is net-new with no existing data in Neon

### Document Assets Migration

- Run after Phase 5 begins
- Scan existing R2 object metadata and any Neon-stored file references
- Create corresponding `document_assets` records in Atlas
- Log orphaned R2 objects that have no database reference

## 21. Disaster Recovery

### Atlas Backups

- Enable Atlas continuous backup with point-in-time recovery (PITR)
- Retain PITR snapshots for 7 days in development, 35 days in production
- Take daily automated snapshots; retain for 30 days in production
- Store one monthly snapshot for 12 months for compliance

### Recovery Targets

| Metric | CMS | GPS | Documents | Activity Logs |
| --- | --- | --- | --- | --- |
| RPO (Recovery Point Objective) | 1 hour | 5 minutes | 1 hour | 24 hours |
| RTO (Recovery Time Objective) | 30 minutes | 15 minutes | 1 hour | 4 hours |

### Recovery Procedures

- CMS recovery: restore from Atlas PITR snapshot; Redis cache auto-rebuilds on first read
- GPS recovery: restore from snapshot; `gps_latest` auto-corrects on next device ping
- Full cluster restore: use Atlas restore-to-new-cluster, verify data, swap connection string in environment variables, restart API

### Data Retention Policies

| Collection | Retention | Mechanism |
| --- | --- | --- |
| `gps_logs` | 90 days (configurable) | TTL index on `receivedAt` |
| `activity_logs` | 180 days | TTL index on `createdAt` |
| `notification_events` | 30 days | TTL index on `createdAt` |
| `cms_page_revisions` | Indefinite | No TTL; prune manually if needed |
| All other collections | Indefinite | No TTL |

## 22. Local Development Setup

### MongoDB for Local Development

Add to `apps/backend/docker-compose.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: jefflink
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### Local Environment Variables

Add to `apps/backend/.env.local`:

```bash
MONGO_URI=mongodb://localhost:27017/jefflink
MONGO_DB_NAME=jefflink
MONGO_APP_NAME=jefflink-api-dev
CMS_ATLAS_ENABLED=true
GPS_ATLAS_ENABLED=true
DOCUMENTS_ATLAS_ENABLED=true
```

### Seed Scripts

- Create `apps/backend/scripts/seed-atlas.ts` to populate local Mongo with sample CMS pages, GPS pings, and document metadata
- The seed script uses the same factory functions defined in test fixtures
- Run via `npx ts-node apps/backend/scripts/seed-atlas.ts` or add an npm script: `"db:seed-atlas": "ts-node scripts/seed-atlas.ts"`

### Index Creation

- Create `apps/backend/scripts/create-atlas-indexes.ts` to ensure all indexes defined in section 7 exist
- Run automatically on application startup in development mode
- Run manually via npm script in staging and production: `"db:ensure-indexes": "ts-node scripts/create-atlas-indexes.ts"`

## 23. Dependencies and Prerequisites

### Phase 0 Prerequisites

- Atlas cluster provisioned in target region
- Atlas database user created with `readWrite` on `jefflink` database
- Render environment group updated with `MONGO_URI` (empty or pointing to Atlas)
- `mongodb` and `zod` packages installed in `apps/backend`

### Phase 1 Prerequisites

- Phase 0 fully deployed and health check passing
- Existing CMS Drizzle tables unchanged and functional
- CMS migration script tested in staging
- Feature flag `CMS_ATLAS_ENABLED` defaults to `false` in production

### Phase 2 Prerequisites

- Phase 1 Atlas CMS collections populated with migrated content
- At least one published CMS homepage page in Atlas
- Web app `apps/web/src/lib/cms.ts` data-access layer created
- Section renderer registry implemented in `apps/web/src/components/cms/`

### Phase 3 Prerequisites

- Phase 2 web CMS rendering validated in staging
- Mobile CMS feature module created at `apps/mobile/src/features/cms/`
- Mobile section renderer components built

### Phase 4 Prerequisites

- At least one GPS tracker device available for testing
- Device authentication scheme defined and `DeviceTokenGuard` implemented
- GPS module registered in `app.module.ts`
- `gps_logs` and `gps_latest` collections created with indexes

### Phase 5 Prerequisites

- Existing R2 object inventory documented
- `document_assets` and `activity_logs` collections created with indexes
- Activity logging interceptor wired into target modules

### Phase 6 Prerequisites

- All prior phases validated in staging
- WebSocket or SSE gateway infrastructure tested
- Change stream listener performance benchmarked under expected load
- Rollback plan rehearsed in staging environment

## 24. Estimated Document Sizes and Capacity Planning

### Per-Document Size Estimates

| Collection | Avg Document Size | Growth Rate |
| --- | --- | --- |
| `cms_pages` | 8–20 KB | Low (tens of pages) |
| `cms_page_revisions` | 10–25 KB | Low (proportional to edits) |
| `cms_navigation` | 2–5 KB | Very low |
| `cms_settings` | 1 KB | Very low |
| `cms_media_refs` | 0.5 KB | Moderate (proportional to media uploads) |
| `gps_logs` | 0.3–0.5 KB | High (one per ping per vehicle) |
| `gps_latest` | 0.4 KB | Static (one per vehicle) |
| `device_registry` | 0.5 KB | Low (one per tracker device) |
| `geofences` | 1–5 KB | Low |
| `gps_alerts` | 0.5 KB | Moderate (proportional to violations) |
| `document_assets` | 0.5 KB | Moderate |
| `activity_logs` | 0.3–0.5 KB | High |
| `notification_events` | 0.5 KB | Moderate |

### Storage Projections (First 12 Months)

Assumptions: 500 active vehicles, 100 GPS pings per vehicle per day, 50 admin users generating 20 activity log entries per day.

| Collection | Year-1 Estimate |
| --- | --- |
| `gps_logs` (90-day TTL) | ~2.5 GB |
| `activity_logs` (180-day TTL) | ~50 MB |
| `cms_*` combined | < 50 MB |
| `document_assets` | ~25 MB |
| `notification_events` (30-day TTL) | ~15 MB |
| **Total estimated** | **~2.7 GB** |

Atlas M10 provides 10 GB; M30 provides 40 GB. Year-1 usage fits comfortably within M10 for development and M30 for production with headroom.

## 25. API Versioning and Backward Compatibility

### Versioning Strategy

- All new Atlas-backed endpoints are registered under the existing `/api/v1` prefix
- No v2 namespace until a breaking change to an existing endpoint is required
- Feature flags (`CMS_ATLAS_ENABLED`, `GPS_ATLAS_ENABLED`, `DOCUMENTS_ATLAS_ENABLED`) control backend data source without changing the API contract
- Response shape follows the existing `TransformInterceptor` format: `{ success: boolean, data: T }`

### Backward Compatibility Rules

- Public CMS read endpoints return the same response shape whether backed by Neon or Atlas
- Existing mobile and web clients must not require an update when the backend switches from Neon CMS to Atlas CMS
- GPS endpoints are net-new and have no backward compatibility constraints
- If a CMS DTO field is added, it must be optional so existing clients can ignore it
- Deprecation of the SQL-backed CMS endpoints happens only after the Atlas path has been stable in production for at least one release cycle

## 26. Error Handling Conventions

### Atlas Operation Errors

- Wrap all Atlas collection operations in try/catch within the store layer
- Map MongoDB driver errors to NestJS HTTP exceptions:
  - `MongoServerError` with code `11000` (duplicate key) → `ConflictException`
  - `MongoNetworkError` → `ServiceUnavailableException`
  - `MongoServerSelectionError` → `ServiceUnavailableException`
  - All other Mongo errors → `InternalServerErrorException`
- Log the original Mongo error at `error` level via Pino; return sanitized messages to clients

### CMS Facade Fallback Errors

- If Atlas store throws and `CMS_ATLAS_ENABLED=true`, log the error and re-throw (do not silently fall back to Neon)
- If `CMS_ATLAS_ENABLED=false`, the Neon store is used directly; Atlas errors are not possible
- The facade never auto-switches stores on error to prevent inconsistent reads

### GPS Ingest Error Handling

- Malformed payloads return `400 Bad Request` with validation details
- If Atlas is unreachable during ingest, return `503 Service Unavailable` and let the device retry
- Do not buffer ingest payloads in Redis to avoid stale-data risks; devices are expected to have built-in retry logic

### Validation Pipeline

- All DTOs use `class-validator` decorators and are enforced by the global `ValidationPipe`
- Zod schemas are used internally within Atlas store implementations for document shape validation before insert/update
- Validation errors from `class-validator` return `400` with field-level error details
- Zod validation failures in the store layer are logged and wrapped in `InternalServerErrorException` (indicates a code bug, not user error)
