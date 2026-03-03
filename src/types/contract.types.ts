export type ContractStatus = "active" | "closed" | "defaulted";

export interface ContractSummary {
  id: string;
  listingId: string;
  customerId: string;
  status: ContractStatus;
  nextInstallmentDate?: string;
}
