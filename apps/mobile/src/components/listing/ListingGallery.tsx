import { Text, View } from "react-native";

type ListingGalleryProps = {
  count: number;
};

export default function ListingGallery({ count }: ListingGalleryProps) {
  return (
    <View className="items-center justify-center rounded-2xl border border-brand-slate bg-brand-night p-6">
      <Text className="text-sm text-brand-muted">{count} photos</Text>
    </View>
  );
}
