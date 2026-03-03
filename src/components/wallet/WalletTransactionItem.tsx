import { Text, View } from "react-native";

type WalletTransactionItemProps = {
  title: string;
  subtitle: string;
  amount: string;
};

export default function WalletTransactionItem({
  title,
  subtitle,
  amount
}: WalletTransactionItemProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-brand-slate py-3">
      <View className="gap-1">
        <Text className="text-sm font-semibold text-white">{title}</Text>
        <Text className="text-xs text-brand-muted">{subtitle}</Text>
      </View>
      <Text className="text-sm text-white">{amount}</Text>
    </View>
  );
}
