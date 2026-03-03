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
  admin: {
    users: "/admin/users",
    contracts: "/admin/contracts",
    payments: "/admin/payments",
    recovery: "/admin/recovery",
    sync: "/admin/sync"
  }
};
