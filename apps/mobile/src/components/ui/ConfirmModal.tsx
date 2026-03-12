import { Pressable, Text, View } from "react-native";
import Modal from "./Modal";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} onClose={onCancel}>
      <View className="gap-3">
        <Text className="text-lg font-semibold text-white">{title}</Text>
        <Text className="text-sm text-brand-muted">{message}</Text>
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 rounded-xl border border-brand-slate px-4 py-3"
            onPress={onCancel}
          >
            <Text className="text-center text-sm text-white">Cancel</Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-xl bg-brand-accent px-4 py-3"
            onPress={onConfirm}
          >
            <Text className="text-center text-sm text-brand-dark">Confirm</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
