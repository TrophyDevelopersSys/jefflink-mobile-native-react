import { Text, View } from "react-native";

type GpsAlertItemProps = {
  title: string;
  time: string;
};

export default function GpsAlertItem({ title, time }: GpsAlertItemProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-brand-slate py-3">
      <Text className="text-sm text-white">{title}</Text>
      <Text className="text-xs text-brand-muted">{time}</Text>
    </View>
  );
}
