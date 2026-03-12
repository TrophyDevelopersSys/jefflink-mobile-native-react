import { Pressable, Text, View } from "react-native";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPress?: () => void;
};

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onPress
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between px-6">
      <View className="gap-1">
        <Text className="text-base font-semibold text-white">{title}</Text>
        {subtitle ? (
          <Text className="text-xs text-brand-muted">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable onPress={onPress}>
          <Text className="text-xs font-semibold text-brand-accent">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
