import { paymentsApi } from "../../api/payments.api";
import type { Installment, PaymentRecord } from "../../types/payment.types";

export const financeService = {
	async listPayments(): Promise<PaymentRecord[]> {
		return paymentsApi.listPayments();
	},
	async getPayment(paymentId: string): Promise<PaymentRecord> {
		return paymentsApi.getPayment(paymentId);
	},
	async listInstallments(contractId: string): Promise<Installment[]> {
		return paymentsApi.listInstallments(contractId);
	}
};
