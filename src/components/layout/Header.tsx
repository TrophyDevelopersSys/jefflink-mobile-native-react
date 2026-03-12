import { Text, View } from "react-native";

type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="gap-1">
      <Text className="text-2xl font-semibold text-white">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-brand-muted">{subtitle}</Text>
      ) : null}
    </View>
  );
}
