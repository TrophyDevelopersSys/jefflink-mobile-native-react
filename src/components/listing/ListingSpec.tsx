import { Text, View } from "react-native";

type ListingSpecProps = {
  label: string;
  value: string;
};

export default function ListingSpec({ label, value }: ListingSpecProps) {
  return (
    <View className="gap-1 rounded-2xl border border-brand-slate bg-brand-night p-3">
      <Text className="text-xs text-brand-muted">{label}</Text>
      <Text className="text-sm font-semibold text-white">{value}</Text>
    </View>
  );
}
