export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me"
  },
  listings: {
    vehicles: "/listings/vehicles",
    properties: "/listings/properties",
    detail: (id: string) => `/listings/${id}`
  },
  payments: {
    list: "/payments",
    detail: (id: string) => `/payments/${id}`
  },
  wallet: {
    overview: "/wallet",
    transactions: "/wallet/transactions"
  },
  admin: {
    // Dashboard & analytics
    dashboard:          "/admin/dashboard",
    analyticsRevenue:   "/admin/analytics/revenue",
    analyticsActivity:  "/admin/analytics/activity",
    // Users
    users:              "/admin/users",
    user:               (id: string) => `/admin/users/${id}`,
    userStatus:         (id: string) => `/admin/users/${id}/status`,
    // Vendors
    vendors:            "/admin/vendors",
    vendor:             (id: string) => `/admin/vendors/${id}`,
    vendorVerify:       (id: string) => `/admin/vendors/${id}/verify`,
    vendorSuspend:      (id: string) => `/admin/vendors/${id}/suspend`,
    // Listings
    pendingVehicles:    "/admin/listings/pending",
    approveVehicle:     (id: string) => `/admin/listings/vehicles/${id}/approve`,
    rejectVehicle:      (id: string) => `/admin/listings/vehicles/${id}/reject`,
    pendingProperties:  "/admin/listings/properties/pending",
    approveProperty:    (id: string) => `/admin/listings/properties/${id}/approve`,
    rejectProperty:     (id: string) => `/admin/listings/properties/${id}/reject`,
    // Reports
    reports:            "/admin/reports",
    resolveReport:      (id: string) => `/admin/reports/${id}/resolve`,
    // Finance
    financeSummary:     "/admin/finance/summary",
    contracts:          "/admin/contracts",
    payments:           "/admin/payments",
    installments:       "/admin/installments",
    withdrawals:        "/admin/withdrawals",
    approveWithdrawal:  (id: string) => `/admin/withdrawals/${id}/approve`,
    rejectWithdrawal:   (id: string) => `/admin/withdrawals/${id}/reject`,
    // Wallets
    walletsSummary:     "/admin/wallets/summary",
    walletTransactions: "/admin/wallets/transactions",
    // Notifications
    notifications:      "/admin/notifications",
    // GPS Tracking
    gps:                "/admin/gps",
    // System
    systemHealth:       "/admin/system/health",
    // Contract detail
    contract:           (id: string) => `/admin/contracts/${id}`,
    // Legacy
    recovery:           "/admin/recovery",
    sync:               "/admin/sync",
    auditLogs:          "/admin/audit-logs",
  },
  users: {
    me: "/users/me",
    updateAvatar: "/users/me/avatar",
  },
  media: {
    upload: "/media/upload",
  },
  cms: {
    homepage:    "/cms/homepage",
    page:        (slug: string) => `/cms/page/${slug}`,
    revisions:   (id: string) => `/cms/page/${id}/revisions`,
    navigation:  (key: string) => `/cms/navigation/${key}`,
    settings:    "/cms/settings",
  },
};
