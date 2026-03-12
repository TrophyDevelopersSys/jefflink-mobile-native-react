import { Text } from "react-native";

type BadgeProps = {
  label: string;
};

export default function Badge({ label }: BadgeProps) {
  return (
    <Text className="self-start rounded-full bg-brand-slate px-3 py-1 text-xs text-white">
      {label}
    </Text>
  );
}
