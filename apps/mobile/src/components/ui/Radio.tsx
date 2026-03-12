import { Pressable, Text, View } from "react-native";

type RadioProps = {
  selected: boolean;
  label: string;
  onSelect: () => void;
};

export default function Radio({ selected, label, onSelect }: RadioProps) {
  return (
    <Pressable className="flex-row items-center gap-3" onPress={onSelect}>
      <View
        className={[
          "h-5 w-5 items-center justify-center rounded-full border",
          selected ? "border-brand-accent" : "border-brand-slate"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {selected ? (
          <View className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
        ) : null}
      </View>
      <Text className="text-sm text-white">{label}</Text>
    </Pressable>
  );
}
