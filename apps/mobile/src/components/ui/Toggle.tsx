import { Pressable, View } from "react-native";

type ToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export default function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      className={[
        "h-6 w-11 rounded-full p-1",
        enabled ? "bg-brand-accent" : "bg-brand-slate"
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <View
        className={[
          "h-4 w-4 rounded-full bg-white",
          enabled ? "ml-5" : "ml-0"
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </Pressable>
  );
}
