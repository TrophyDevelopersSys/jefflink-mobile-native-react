import { requireRole } from "../middleware/rbac";

export const rbac = {
  ledgerView: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER"]),
  paymentApproval: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER"]),
  settlement: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER"]),
  withdrawalApproval: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER"]),
  recoveryAccess: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "RECOVERY_AGENT"]),
  branchOperations: requireRole(["SYSTEM_ADMIN", "DIRECTOR", "BRANCH_OFFICER"]),
  vendorWallet: requireRole(["VENDOR"])
};
