import { Pressable, Text } from "react-native";

type IconButtonProps = {
  icon: string;
  onPress: () => void;
};

export default function IconButton({ icon, onPress }: IconButtonProps) {
  return (
    <Pressable
      className="h-10 w-10 items-center justify-center rounded-full bg-brand-slate"
      onPress={onPress}
    >
      <Text className="text-white">{icon}</Text>
    </Pressable>
  );
}
