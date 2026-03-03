import { create } from "zustand";
import type { PaymentRecord, Installment } from "../types/payment.types";

interface PaymentState {
  payments: PaymentRecord[];
  installments: Installment[];
  setPayments: (payments: PaymentRecord[]) => void;
  setInstallments: (installments: Installment[]) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  installments: [],
  setPayments: (payments) => set({ payments }),
  setInstallments: (installments) => set({ installments })
}));
