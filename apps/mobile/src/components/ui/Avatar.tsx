import { Text, View } from "react-native";

type AvatarProps = {
  initials: string;
};

export default function Avatar({ initials }: AvatarProps) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-slate">
      <Text className="text-sm font-semibold text-white">{initials}</Text>
    </View>
  );
}
