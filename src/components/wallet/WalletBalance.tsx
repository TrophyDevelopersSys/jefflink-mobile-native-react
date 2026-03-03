import { Text, View } from "react-native";

type WalletBalanceProps = {
  label: string;
  balance: string;
};

export default function WalletBalance({ label, balance }: WalletBalanceProps) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-brand-muted">{label}</Text>
      <Text className="text-2xl font-semibold text-white">{balance}</Text>
    </View>
  );
}
