import { Text, View } from "react-native";

type SelectProps = {
  label: string;
  value: string;
};

export default function Select({ label, value }: SelectProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-brand-muted">{label}</Text>
      <View className="rounded-xl border border-brand-slate bg-brand-night px-4 py-3">
        <Text className="text-sm text-white">{value}</Text>
      </View>
    </View>
  );
}
