import { Text, View } from "react-native";

type ChipProps = {
  label: string;
};

export default function Chip({ label }: ChipProps) {
  return (
    <View className="rounded-full border border-brand-slate px-3 py-1">
      <Text className="text-xs text-white">{label}</Text>
    </View>
  );
}
