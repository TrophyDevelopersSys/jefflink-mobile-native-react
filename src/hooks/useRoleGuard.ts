import { isAdminRole } from "../utils/roleHelpers";
import type { UserRole } from "../constants/roles";

export const useRoleGuard = (role?: UserRole) => {
  return {
    isAdmin: isAdminRole(role)
  };
};
