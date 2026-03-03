import { Text, View } from "react-native";

type PriceDisplayProps = {
  price: string;
  label?: string;
};

export default function PriceDisplay({ price, label }: PriceDisplayProps) {
  return (
    <View className="gap-1">
      {label ? <Text className="text-xs text-brand-muted">{label}</Text> : null}
      <Text className="text-2xl font-semibold text-white">{price}</Text>
    </View>
  );
}
