export type WalletOverview = {
  balance: string;
  available: string;
  currency: string;
};

export type WalletTransaction = {
  id: string;
  amount: string;
  description: string;
  occurredAt: string;
  status: "pending" | "completed" | "failed";
};
