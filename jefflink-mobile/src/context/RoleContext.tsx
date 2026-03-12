import { createContext, useContext } from "react";
import type { UserRole } from "../constants/roles";

export type RoleContextValue = {
  role?: UserRole;
};

const RoleContext = createContext<RoleContextValue>({});

export const useRoleContext = () => useContext(RoleContext);

export default RoleContext;
