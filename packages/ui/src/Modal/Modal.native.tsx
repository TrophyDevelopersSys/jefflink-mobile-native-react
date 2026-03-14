import React from "react";
import { Modal as RNModal, View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({ visible, onClose, title, children, showCloseButton = true, className = "" }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/60" onPress={onClose} />
        <View className={`bg-card rounded-t-2xl max-h-[85%] ${className}`}>
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>
          {/* Header */}
          {(title || showCloseButton) ? (
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-border/40">
              {title ? <Text className="text-base font-semibold text-text">{title}</Text> : <View />}
              {showCloseButton ? (
                <Pressable onPress={onClose} accessibilityLabel="Close" className="p-1">
                  <Text className="text-text-muted text-lg">✕</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {/* Content */}
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
