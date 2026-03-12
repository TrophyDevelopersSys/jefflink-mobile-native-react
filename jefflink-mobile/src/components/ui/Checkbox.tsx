import { Pressable, Text, View } from "react-native";

type CheckboxProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
};

export default function Checkbox({ checked, label, onToggle }: CheckboxProps) {
  return (
    <Pressable className="flex-row items-center gap-3" onPress={onToggle}>
      <View
        className={[
          "h-5 w-5 items-center justify-center rounded border",
          checked ? "border-brand-accent bg-brand-accent" : "border-brand-slate"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {checked ? <Text className="text-xs text-brand-dark">✓</Text> : null}
      </View>
      <Text className="text-sm text-white">{label}</Text>
    </Pressable>
  );
}
