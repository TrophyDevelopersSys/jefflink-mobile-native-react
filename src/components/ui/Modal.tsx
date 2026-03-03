import { Modal as RNModal, View, Text, Pressable } from "react-native";

type ModalProps = {
  visible: boolean;
  title: string;
  description: string;
  onClose: () => void;
};

export default function Modal({
  visible,
  title,
  description,
  onClose
}: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-2xl border border-brand-slate bg-brand-night p-6">
          <Text className="text-lg font-semibold text-white">{title}</Text>
          <Text className="mt-2 text-sm text-brand-muted">
            {description}
          </Text>
          <Pressable
            onPress={onClose}
            className="mt-4 rounded-xl bg-brand-accent px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white">
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </RNModal>
  );
}
