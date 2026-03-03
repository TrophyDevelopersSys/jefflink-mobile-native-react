import { Text, View } from "react-native";

type BalanceSummaryProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function BalanceSummary({
  title,
  value,
  subtitle
}: BalanceSummaryProps) {
  return (
    <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-sm text-brand-muted">{title}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{value}</Text>
      {subtitle ? (
        <Text className="mt-1 text-xs text-brand-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
