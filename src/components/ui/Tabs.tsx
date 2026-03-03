import { Pressable, Text, View } from "react-native";

type TabsProps = {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function Tabs({ tabs, activeIndex, onChange }: TabsProps) {
  return (
    <View className="flex-row rounded-full border border-brand-slate bg-brand-night p-1">
      {tabs.map((tab, index) => {
        const active = index === activeIndex;
        return (
          <Pressable
            key={tab}
            className={[
              "flex-1 items-center rounded-full px-3 py-2",
              active ? "bg-brand-accent" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            onPress={() => onChange(index)}
          >
            <Text
              className={[
                "text-xs",
                active ? "text-brand-dark" : "text-brand-muted"
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
