import { Text, View } from "react-native";

type ListingMetaProps = {
  items: string[];
};

export default function ListingMeta({ items }: ListingMetaProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <Text
          key={item}
          className="rounded-full border border-brand-slate px-3 py-1 text-xs text-white"
        >
          {item}
        </Text>
      ))}
    </View>
  );
}
