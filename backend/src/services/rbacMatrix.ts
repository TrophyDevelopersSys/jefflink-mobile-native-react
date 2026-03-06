import { requireRole } from "../middleware/rbac";

export const rbac = {
  ledgerView: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER", "ADMIN", "MANAGER"]),
  paymentApproval: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER", "ADMIN", "MANAGER"]),
  settlement: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER", "ADMIN", "MANAGER"]),
  withdrawalApproval: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER", "ADMIN", "MANAGER"]),
  recoveryAccess: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "RECOVERY_AGENT", "ADMIN", "MANAGER"]),
  branchOperations: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "BRANCH_OFFICER", "ADMIN", "MANAGER"]),
  vendorWallet: requireRole(["VENDOR", "AGENT"])
};
