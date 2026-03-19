import { AdminRoles, DealerRoles, type UserRole } from "../constants/roles";

export const isAdminRole = (role?: UserRole) => {
  return role ? AdminRoles.includes(role) : false;
};

export const isDealerRole = (role?: UserRole) => {
  return role ? DealerRoles.includes(role) : false;
};
