import { Text, View } from "react-native";

type DataTablePlaceholderProps = {
  title: string;
  subtitle?: string;
};

export default function DataTablePlaceholder({
  title,
  subtitle
}: DataTablePlaceholderProps) {
  return (
    <View className="rounded-2xl border border-brand-slate bg-brand-night p-6">
      <Text className="text-base font-semibold text-white">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-sm text-brand-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
