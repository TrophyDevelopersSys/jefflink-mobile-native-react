import { Text, View } from "react-native";

type GpsStatusCardProps = {
  title: string;
  status: string;
};

export default function GpsStatusCard({
  title,
  status
}: GpsStatusCardProps) {
  return (
    <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
      <Text className="text-xs text-brand-muted">{title}</Text>
      <Text className="mt-2 text-sm font-semibold text-white">{status}</Text>
    </View>
  );
}
