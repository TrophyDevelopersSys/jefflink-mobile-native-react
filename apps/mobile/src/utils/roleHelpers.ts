import { AdminRoles, type UserRole } from "../constants/roles";

export const isAdminRole = (role?: UserRole) => {
  return role ? AdminRoles.includes(role) : false;
};
