import { Text, View } from "react-native";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-xs text-brand-muted">{label}</Text>
      <Text className="mt-2 text-2xl font-semibold text-white">{value}</Text>
      {helper ? (
        <Text className="mt-1 text-xs text-brand-muted">{helper}</Text>
      ) : null}
    </View>
  );
}
