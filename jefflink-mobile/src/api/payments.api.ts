import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { PaymentRecord, Installment } from "../types/payment.types";

export const paymentsApi = {
  async listPayments(): Promise<PaymentRecord[]> {
    const response = await apiClient.get(endpoints.payments.list);
    return response.data as PaymentRecord[];
  },
  async getPayment(paymentId: string): Promise<PaymentRecord> {
    const response = await apiClient.get(endpoints.payments.detail(paymentId));
    return response.data as PaymentRecord;
  },
  async listInstallments(contractId: string): Promise<Installment[]> {
    const response = await apiClient.get(
      `${endpoints.payments.list}?contractId=${contractId}`
    );
    return response.data as Installment[];
  }
};
