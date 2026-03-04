import React from "react";
import { Modal as RNModal, View, Text, Pressable } from "react-native";

type ModalProps = {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({
  visible,
  title,
  description,
  onClose,
  children
}: ModalProps) {
  const hasCustomContent = children !== undefined && children !== null;
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-2xl border border-brand-slate bg-brand-night p-6">
          {hasCustomContent ? (
            children
          ) : (
            <>
              {title ? (
                <Text className="text-lg font-semibold text-white">{title}</Text>
              ) : null}
              {description ? (
                <Text className="mt-2 text-sm text-brand-muted">
                  {description}
                </Text>
              ) : null}
              <Pressable
                onPress={onClose}
                className="mt-4 rounded-xl bg-brand-accent px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-brand-dark">
                  Close
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </RNModal>
  );
}
