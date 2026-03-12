export type PaymentStatus = "pending" | "paid" | "overdue" | "failed";

export interface Installment {
  id: string;
  dueDate: string;
  amount: string;
  status: PaymentStatus;
}

export interface PaymentRecord {
  id: string;
  contractId: string;
  amount: string;
  status: PaymentStatus;
  paidAt?: string;
}
