import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  message: string;
};

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 rounded-2xl border border-brand-slate bg-brand-night p-6">
      <Text className="text-base font-semibold text-white">{title}</Text>
      <Text className="text-center text-sm text-brand-muted">{message}</Text>
    </View>
  );
}
