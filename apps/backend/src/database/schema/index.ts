import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────────────────────
// Users & Roles
// ─────────────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    avatarUrl: text('avatar_url'),
    status: varchar('status', { length: 50 }).notNull().default('ACTIVE'),
    refreshTokenHash: text('refresh_token_hash'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
  }),
);

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    branchId: uuid('branch_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('roles_user_idx').on(t.userId),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Vehicles (Car Listings)
// ─────────────────────────────────────────────────────────────────────────────

export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    vendorId: uuid('vendor_id').references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    make: varchar('make', { length: 100 }),
    model: varchar('model', { length: 100 }),
    year: integer('year'),
    type: varchar('type', { length: 100 }),
    location: varchar('location', { length: 255 }),
    price: numeric('price', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    status: varchar('status', { length: 50 }).notNull().default('AVAILABLE'),
    description: text('description'),
    attributes: jsonb('attributes'),
    searchVector: text('search_vector'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index('vehicles_status_idx').on(t.status),
    vendorIdx: index('vehicles_vendor_idx').on(t.vendorId),
    locationIdx: index('vehicles_location_idx').on(t.location),
    priceIdx: index('vehicles_price_idx').on(t.price),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Properties (Real Estate Listings)
// ─────────────────────────────────────────────────────────────────────────────

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    vendorId: uuid('vendor_id').references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    propertyType: varchar('property_type', { length: 100 }), // house, land, apartment
    location: varchar('location', { length: 255 }),
    district: varchar('district', { length: 100 }),
    price: numeric('price', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    bedrooms: integer('bedrooms'),
    bathrooms: integer('bathrooms'),
    sizeM2: numeric('size_m2', { precision: 10, scale: 2 }),
    status: varchar('status', { length: 50 }).notNull().default('AVAILABLE'),
    description: text('description'),
    attributes: jsonb('attributes'),
    searchVector: text('search_vector'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index('properties_status_idx').on(t.status),
    vendorIdx: index('properties_vendor_idx').on(t.vendorId),
    locationIdx: index('properties_location_idx').on(t.location),
    priceIdx: index('properties_price_idx').on(t.price),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const contracts = pgTable(
  'contracts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    vehicleId: uuid('vehicle_id').references(() => vehicles.id),
    propertyId: uuid('property_id').references(() => properties.id),
    status: varchar('status', { length: 50 }).notNull().default('DRAFT'),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    // ── Finance terms ──────────────────────────────────────────────────────
    initialDeposit: numeric('initial_deposit', { precision: 15, scale: 2 }),
    interestRate: numeric('interest_rate', { precision: 5, scale: 4 }),   // annual rate, e.g. 0.18 = 18%
    termMonths: integer('term_months'),                                    // number of monthly instalments
    monthlyAmount: numeric('monthly_amount', { precision: 15, scale: 2 }), // calculated EMI
    depositPaid: boolean('deposit_paid').default(false).notNull(),
    // ────────────────────────────────────────────────────────────────────────
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    terms: jsonb('terms'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('contracts_user_idx').on(t.userId),
    statusIdx: index('contracts_status_idx').on(t.status),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Payments & Installments
// ─────────────────────────────────────────────────────────────────────────────

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .references(() => contracts.id)
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id)
      .notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    paymentType: varchar('payment_type', { length: 50 }).notNull().default('MONTHLY'), // INITIAL_DEPOSIT | MONTHLY | PENALTY | SETTLEMENT
    paymentMethod: varchar('payment_method', { length: 100 }),
    momoTransactionId: varchar('momo_transaction_id', { length: 255 }),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).unique(),
    approvedBy: uuid('approved_by').references(() => users.id),
    notes: text('notes'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    contractIdx: index('payments_contract_idx').on(t.contractId),
    userIdx: index('payments_user_idx').on(t.userId),
    statusIdx: index('payments_status_idx').on(t.status),
  }),
);

export const installments = pgTable(
  'installments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .references(() => contracts.id)
      .notNull(),
    dueDate: timestamp('due_date').notNull(),
    installmentNumber: integer('installment_number').notNull(), // 1-based month index
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),   // total EMI
    principal: numeric('principal', { precision: 15, scale: 2 }),       // principal portion
    interest: numeric('interest', { precision: 15, scale: 2 }),         // interest portion
    balance: numeric('balance', { precision: 15, scale: 2 }),           // outstanding after payment
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    paidAt: timestamp('paid_at'),
    paymentId: uuid('payment_id').references(() => payments.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    contractIdx: index('installments_contract_idx').on(t.contractId),
    statusIdx: index('installments_status_idx').on(t.status),
    dueDateIdx: index('installments_due_date_idx').on(t.dueDate),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Ledger
// ─────────────────────────────────────────────────────────────────────────────

export const ledgerTransactions = pgTable(
  'ledger_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    debitAccount: varchar('debit_account', { length: 100 }).notNull(),
    creditAccount: varchar('credit_account', { length: 100 }).notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 50 }),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    referenceIdx: index('ledger_reference_idx').on(t.referenceId),
    debitIdx: index('ledger_debit_idx').on(t.debitAccount),
    creditIdx: index('ledger_credit_idx').on(t.creditAccount),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Vendor Wallet
// ─────────────────────────────────────────────────────────────────────────────

export const vendorWallets = pgTable('vendor_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  balance: numeric('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 10 }).default('UGX'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const withdrawals = pgTable(
  'withdrawals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    vendorId: uuid('vendor_id')
      .references(() => users.id)
      .notNull(),
    amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).default('UGX'),
    status: varchar('status', { length: 50 }).notNull().default('PENDING'),
    approvedBy: uuid('approved_by').references(() => users.id),
    debitAccount: varchar('debit_account', { length: 100 }),
    creditAccount: varchar('credit_account', { length: 100 }),
    processedAt: timestamp('processed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    vendorIdx: index('withdrawals_vendor_idx').on(t.vendorId),
    statusIdx: index('withdrawals_status_idx').on(t.status),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Media Assets
// ─────────────────────────────────────────────────────────────────────────────

export const mediaAssets = pgTable(
  'media_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    uploadedBy: uuid('uploaded_by')
      .references(() => users.id)
      .notNull(),
    bucket: varchar('bucket', { length: 100 }).notNull(),
    key: text('key').notNull(),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    mimeType: varchar('mime_type', { length: 100 }),
    sizeBytes: integer('size_bytes'),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 50 }),
    isCover: boolean('is_cover').default(false),
    // ACTIVE | DELETED
    status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    referenceIdx: index('media_reference_idx').on(t.referenceId),
    uploadedByIdx: index('media_uploaded_by_idx').on(t.uploadedBy),
    statusIdx: index('media_status_idx').on(t.status),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// CMS – Hero Sliders
// ─────────────────────────────────────────────────────────────────────────────

export const cmsSliders = pgTable(
  'cms_sliders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    subtitle: text('subtitle'),
    imageUrl: text('image_url').notNull(),       // R2 CDN URL
    buttonLabel: varchar('button_label', { length: 100 }),
    buttonLink: varchar('button_link', { length: 500 }),
    // display order (lower = first)
    sortOrder: integer('sort_order').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    activeIdx: index('cms_sliders_active_idx').on(t.active),
    orderIdx: index('cms_sliders_order_idx').on(t.sortOrder),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// CMS – Banners (promo strips, section banners)
// ─────────────────────────────────────────────────────────────────────────────

export const cmsBanners = pgTable(
  'cms_banners',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // e.g. "home_top", "home_mid", "cars_sidebar"
    placement: varchar('placement', { length: 100 }).notNull(),
    imageUrl: text('image_url').notNull(),
    linkUrl: varchar('link_url', { length: 500 }),
    altText: varchar('alt_text', { length: 255 }),
    active: boolean('active').notNull().default(true),
    startsAt: timestamp('starts_at'),
    endsAt: timestamp('ends_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    placementIdx: index('cms_banners_placement_idx').on(t.placement),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// CMS – Generic text/SEO content blocks
// ─────────────────────────────────────────────────────────────────────────────

export const cmsContent = pgTable(
  'cms_content',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // unique machine key, e.g. "homepage_hero_title", "footer_tagline"
    key: varchar('key', { length: 255 }).notNull().unique(),
    value: text('value').notNull(),
    // "text" | "html" | "json" | "url"
    type: varchar('type', { length: 50 }).notNull().default('text'),
    description: text('description'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: uniqueIndex('cms_content_key_idx').on(t.key),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    data: jsonb('data'),
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('notifications_user_idx').on(t.userId),
    readIdx: index('notifications_read_idx').on(t.isRead),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Favorites
// ─────────────────────────────────────────────────────────────────────────────

export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    referenceId: uuid('reference_id').notNull(),
    referenceType: varchar('reference_type', { length: 50 }).notNull(), // vehicle | property
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    userRefIdx: uniqueIndex('favorites_user_ref_idx').on(
      t.userId,
      t.referenceId,
      t.referenceType,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────────────────────

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reviewerId: uuid('reviewer_id')
      .references(() => users.id)
      .notNull(),
    vendorId: uuid('vendor_id')
      .references(() => users.id)
      .notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    vendorIdx: index('reviews_vendor_idx').on(t.vendorId),
    reviewerIdx: index('reviews_reviewer_idx').on(t.reviewerId),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(roles),
  vehicles: many(vehicles),
  properties: many(properties),
  payments: many(payments),
  notifications: many(notifications),
  favorites: many(favorites),
}));

export const rolesRelations = relations(roles, ({ one }) => ({
  user: one(users, { fields: [roles.userId], references: [users.id] }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  vendor: one(users, { fields: [vehicles.vendorId], references: [users.id] }),
  media: many(mediaAssets),
  contracts: many(contracts),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  vendor: one(users, { fields: [properties.vendorId], references: [users.id] }),
  media: many(mediaAssets),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  user: one(users, { fields: [contracts.userId], references: [users.id] }),
  vehicle: one(vehicles, {
    fields: [contracts.vehicleId],
    references: [vehicles.id],
  }),
  property: one(properties, {
    fields: [contracts.propertyId],
    references: [properties.id],
  }),
  payments: many(payments),
  installments: many(installments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

export const vendorWalletsRelations = relations(vendorWallets, ({ one }) => ({
  vendor: one(users, {
    fields: [vendorWallets.vendorId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Vendor Profiles (verification & business details)
// ─────────────────────────────────────────────────────────────────────────────

export const vendorProfiles = pgTable(
  'vendor_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .unique()
      .notNull(),
    businessName: varchar('business_name', { length: 255 }),
    businessType: varchar('business_type', { length: 100 }), // DEALERSHIP | INDIVIDUAL | AGENCY
    location: varchar('location', { length: 255 }),
    district: varchar('district', { length: 100 }),
    tinNumber: varchar('tin_number', { length: 50 }),
    licenseNumber: varchar('license_number', { length: 100 }),
    verificationStatus: varchar('verification_status', { length: 50 })
      .notNull()
      .default('PENDING'), // PENDING | VERIFIED | REJECTED | SUSPENDED
    verifiedBy: uuid('verified_by').references(() => users.id),
    verifiedAt: timestamp('verified_at'),
    rejectionReason: text('rejection_reason'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    userIdx: uniqueIndex('vendor_profiles_user_idx').on(t.userId),
    statusIdx: index('vendor_profiles_status_idx').on(t.verificationStatus),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Listing Reports (flagged vehicles / properties)
// ─────────────────────────────────────────────────────────────────────────────

export const listingReports = pgTable(
  'listing_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reportedBy: uuid('reported_by')
      .references(() => users.id)
      .notNull(),
    referenceId: uuid('reference_id').notNull(),         // vehicle_id or property_id
    referenceType: varchar('reference_type', { length: 50 }).notNull(), // vehicle | property
    reason: varchar('reason', { length: 100 }).notNull(), // FRAUD | DUPLICATE | INAPPROPRIATE | OTHER
    description: text('description'),
    status: varchar('status', { length: 50 }).notNull().default('OPEN'), // OPEN | RESOLVED | DISMISSED
    resolvedBy: uuid('resolved_by').references(() => users.id),
    resolutionNote: text('resolution_note'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    referenceIdx: index('listing_reports_ref_idx').on(t.referenceId, t.referenceType),
    statusIdx: index('listing_reports_status_idx').on(t.status),
    reportedByIdx: index('listing_reports_reporter_idx').on(t.reportedBy),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin Audit Logs (immutable action trail)
// ─────────────────────────────────────────────────────────────────────────────

export const adminLogs = pgTable(
  'admin_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    adminId: uuid('admin_id')
      .references(() => users.id)
      .notNull(),
    action: varchar('action', { length: 100 }).notNull(),   // e.g. SUSPEND_USER, APPROVE_LISTING
    entityType: varchar('entity_type', { length: 50 }),     // user | vendor | vehicle | contract
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata'),                            // before/after snapshot, extra context
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    adminIdx: index('admin_logs_admin_idx').on(t.adminId),
    entityIdx: index('admin_logs_entity_idx').on(t.entityId),
    actionIdx: index('admin_logs_action_idx').on(t.action),
    createdAtIdx: index('admin_logs_created_at_idx').on(t.createdAt),
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Admin Logs Relations
// ─────────────────────────────────────────────────────────────────────────────

export const vendorProfilesRelations = relations(vendorProfiles, ({ one }) => ({
  user: one(users, { fields: [vendorProfiles.userId], references: [users.id] }),
  verifier: one(users, { fields: [vendorProfiles.verifiedBy], references: [users.id] }),
}));

export const listingReportsRelations = relations(listingReports, ({ one }) => ({
  reporter: one(users, { fields: [listingReports.reportedBy], references: [users.id] }),
  resolver: one(users, { fields: [listingReports.resolvedBy], references: [users.id] }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, { fields: [adminLogs.adminId], references: [users.id] }),
}));
