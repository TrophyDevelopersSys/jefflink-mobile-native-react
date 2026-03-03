import { Text } from "react-native";

type StatusBadgeProps = {
  label: string;
};

export default function StatusBadge({ label }: StatusBadgeProps) {
  return (
    <Text className="self-start rounded-full border border-brand-slate px-3 py-1 text-xs text-white">
      {label}
    </Text>
  );
}
