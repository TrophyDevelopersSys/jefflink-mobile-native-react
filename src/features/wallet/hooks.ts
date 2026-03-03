import { useCallback, useState } from "react";
import type { WalletOverview, WalletTransaction } from "./types";
import { walletService } from "./service";

type WalletAsyncState = {
  loading: boolean;
  error: string | null;
};

export function useWalletOverview() {
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [state, setState] = useState<WalletAsyncState>({
    loading: false,
    error: null
  });

  const loadOverview = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await walletService.getOverview();
      setOverview(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load wallet"
      });
    }
  }, []);

  return { overview, loadOverview, ...state };
}

export function useWalletTransactions() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [state, setState] = useState<WalletAsyncState>({
    loading: false,
    error: null
  });

  const loadTransactions = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await walletService.listTransactions();
      setTransactions(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load transactions"
      });
    }
  }, []);

  return { transactions, loadTransactions, ...state };
}

export default function useWalletFeature() {
  const overview = useWalletOverview();
  const transactions = useWalletTransactions();

  return { overview, transactions };
}
