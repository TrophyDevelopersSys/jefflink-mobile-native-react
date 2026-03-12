export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type PaymentMethod = "mobile_money" | "card" | "bank_transfer";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  description?: string;
  createdAt: string;
}

export interface WalletSummary {
  balance: number;
  currency: string;
  pendingBalance: number;
}
