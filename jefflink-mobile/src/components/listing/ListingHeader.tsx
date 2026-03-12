import { Text, View } from "react-native";

type ListingHeaderProps = {
  title: string;
  subtitle: string;
};

export default function ListingHeader({ title, subtitle }: ListingHeaderProps) {
  return (
    <View className="gap-1">
      <Text className="text-lg font-semibold text-white">{title}</Text>
      <Text className="text-sm text-brand-muted">{subtitle}</Text>
    </View>
  );
}
