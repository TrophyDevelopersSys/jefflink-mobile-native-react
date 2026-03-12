import { Text, View } from "react-native";

type DataRowProps = {
  label: string;
  value: string;
};

export default function DataRow({ label, value }: DataRowProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-brand-slate py-3">
      <Text className="text-sm text-brand-muted">{label}</Text>
      <Text className="text-sm text-white">{value}</Text>
    </View>
  );
}
