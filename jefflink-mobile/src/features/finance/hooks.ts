import { useCallback, useState } from "react";
import type { Installment, PaymentRecord } from "../../types/payment.types";
import { financeService } from "./service";

type FinanceAsyncState = {
  loading: boolean;
  error: string | null;
};

export function useFinancePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [state, setState] = useState<FinanceAsyncState>({
    loading: false,
    error: null
  });

  const loadPayments = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await financeService.listPayments();
      setPayments(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load payments"
      });
    }
  }, []);

  return { payments, loadPayments, ...state };
}

export function useFinanceInstallments(contractId?: string) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [state, setState] = useState<FinanceAsyncState>({
    loading: false,
    error: null
  });

  const loadInstallments = useCallback(async () => {
    if (!contractId) {
      setInstallments([]);
      return;
    }

    setState({ loading: true, error: null });
    try {
      const data = await financeService.listInstallments(contractId);
      setInstallments(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load installments"
      });
    }
  }, [contractId]);

  return { installments, loadInstallments, ...state };
}

export default function useFinanceFeature(contractId?: string) {
  const payments = useFinancePayments();
  const installments = useFinanceInstallments(contractId);

  return {
    payments,
    installments
  };
}
