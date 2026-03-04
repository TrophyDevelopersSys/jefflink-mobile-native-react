import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

export type DrawerItemKey =
  | "about"
  | "help"
  | "contact"
  | "terms"
  | "settings";

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
  onItemPress?: (item: DrawerItemKey) => void;
};

const drawerItems: Array<{ key: DrawerItemKey; label: string }> = [
  { key: "about", label: "About" },
  { key: "help", label: "Help" },
  { key: "contact", label: "Contact" },
  { key: "terms", label: "Terms" },
  { key: "settings", label: "Settings" }
];

export default function DrawerMenu({
  visible,
  onClose,
  onItemPress
}: DrawerMenuProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-brand-dark/70" onPress={onClose}>
        <Pressable className="rounded-t-3xl border-t border-brand-slate bg-brand-night px-5 pb-8 pt-5">
          <Text className="text-base font-semibold text-white">Menu</Text>

          <View className="mt-4 gap-y-4">
            {drawerItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => {
                  onItemPress?.(item.key);
                  onClose();
                }}
              >
                <Text className="text-sm text-brand-muted">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
