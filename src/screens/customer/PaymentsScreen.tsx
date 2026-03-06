import { ScrollView, Text, View } from "react-native";
import { useEffect } from "react";
import AppChrome from "../../components/layout/AppChrome";
import Header from "../../components/layout/Header";
import PaymentItem from "../../components/finance/PaymentItem";
import WalletCard from "../../components/wallet/WalletCard";
import WalletTransactionItem from "../../components/wallet/WalletTransactionItem";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { useFinancePayments } from "../../features/finance";
import { useWalletOverview, useWalletTransactions } from "../../features/wallet";

export default function PaymentsScreen() {
  const { payments, loadPayments, loading, error } = useFinancePayments();
  const {
    overview,
    loadOverview,
    loading: walletLoading,
    error: walletError
  } = useWalletOverview();
  const {
    transactions,
    loadTransactions,
    loading: walletTxLoading,
    error: walletTxError
  } = useWalletTransactions();

  useEffect(() => {
    loadPayments();
    loadOverview();
    loadTransactions();
  }, [loadPayments, loadOverview, loadTransactions]);

  return (
    <AppChrome
      title="Payments"
      activeKey="finance"
      variant="customer"
      showBottomNav={false}
    >
      <ScrollView contentContainerClassName="gap-4 px-6 pt-6 pb-6">
        <Header title="Payments" subtitle="Neon-backed records" />
        {walletLoading ? (
          <Spinner size="large" />
        ) : walletError ? (
          <EmptyState title="Wallet unavailable" message={walletError} />
        ) : overview ? (
          <WalletCard
            title="Wallet balance"
            amount={`${overview.currency} ${overview.balance}`}
          />
        ) : (
          <WalletCard title="Wallet balance" amount="UGX 0" />
        )}
        <View className="gap-2">
          <Text className="text-base font-semibold text-white">
            Latest activity
          </Text>
          {walletTxLoading ? (
            <Spinner />
          ) : walletTxError ? (
            <EmptyState title="No activity" message={walletTxError} />
          ) : transactions.length ? (
            transactions.slice(0, 1).map((transaction) => (
              <WalletTransactionItem
                key={transaction.id}
                title={transaction.description}
                subtitle={transaction.occurredAt}
                amount={transaction.amount}
              />
            ))
          ) : (
            <WalletTransactionItem
              title="No transactions yet"
              subtitle="Transactions will appear here"
              amount="UGX 0"
            />
          )}
        </View>
        <View className="gap-3">
          <StatusBadge label="Ledger verified" />
          {loading ? (
            <Spinner size="large" />
          ) : error ? (
            <EmptyState title="Unable to load" message={error} />
          ) : payments.length ? (
            payments.map((payment) => (
              <PaymentItem key={payment.id} payment={payment} />
            ))
          ) : (
            <EmptyState
              title="No payments yet"
              message="Payment history will appear after the first installment."
            />
          )}
          <Text className="text-xs text-brand-muted">
            Payment history is always read-only from the API.
          </Text>
        </View>
      </ScrollView>
    </AppChrome>
  );
}
