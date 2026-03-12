import { Text, View } from "react-native";

type WalletCardProps = {
  title: string;
  amount: string;
};

export default function WalletCard({ title, amount }: WalletCardProps) {
  return (
    <View className="rounded-2xl border border-brand-slate bg-brand-night p-5">
      <Text className="text-xs text-brand-muted">{title}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{amount}</Text>
    </View>
  );
}
