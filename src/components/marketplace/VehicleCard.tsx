import { Text, View } from "react-native";
import Badge from "../ui/Badge";

export type VehicleCardProps = {
  title: string;
  price: string;
  location: string;
  dealer: string;
  verified?: boolean;
  hirePurchaseReady?: boolean;
};

export default function VehicleCard({
  title,
  price,
  location,
  dealer,
  verified,
  hirePurchaseReady
}: VehicleCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl border border-brand-slate bg-brand-night">
      <View className="h-40 bg-brand-slate">
        <View className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent" />
        <View className="absolute bottom-3 left-3 right-3 gap-2">
          <Text className="text-lg font-semibold text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-2xl font-semibold text-white">{price}</Text>
          <View className="flex-row flex-wrap gap-2">
            {hirePurchaseReady ? <Badge label="Hire Purchase" /> : null}
            {verified ? <Badge label="Verified" /> : null}
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-xs text-brand-muted">{location}</Text>
          <Text className="text-sm text-white">{dealer}</Text>
        </View>
        <View className="rounded-full bg-brand-accent/15 px-3 py-1">
          <Text className="text-xs font-semibold text-brand-accent">
            Finance Ready
          </Text>
        </View>
      </View>
    </View>
  );
}
