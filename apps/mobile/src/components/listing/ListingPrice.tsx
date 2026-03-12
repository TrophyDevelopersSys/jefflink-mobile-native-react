import { Text, View } from "react-native";

type ListingPriceProps = {
  price: string;
  cadence?: string;
};

export default function ListingPrice({ price, cadence }: ListingPriceProps) {
  return (
    <View className="gap-1">
      <Text className="text-2xl font-semibold text-white">{price}</Text>
      {cadence ? (
        <Text className="text-xs text-brand-muted">{cadence}</Text>
      ) : null}
    </View>
  );
}
