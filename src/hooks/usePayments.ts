import { useCallback } from "react";
import { paymentsApi } from "../api/payments.api";
import { usePaymentStore } from "../store/payment.store";

export const usePayments = () => {
  const { payments, installments, setPayments, setInstallments } =
    usePaymentStore();

  const loadPayments = useCallback(async () => {
    const data = await paymentsApi.listPayments();
    setPayments(data);
  }, [setPayments]);

  const loadInstallments = useCallback(
    async (contractId: string) => {
      const data = await paymentsApi.listInstallments(contractId);
      setInstallments(data);
    },
    [setInstallments]
  );

  return { payments, installments, loadPayments, loadInstallments };
};
