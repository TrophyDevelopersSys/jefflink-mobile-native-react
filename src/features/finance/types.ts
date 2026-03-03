import type { Installment, PaymentRecord } from "../../types/payment.types";

export type FinanceOverview = {
  outstandingBalance: string;
  nextDueDate?: string;
  nextAmount?: string;
};

export type FinanceState = {
  payments: PaymentRecord[];
  installments: Installment[];
};
