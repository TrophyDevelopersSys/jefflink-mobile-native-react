import React from "react";
import { View, Text, Pressable, SafeAreaView } from "react-native";
import { PriceTag } from "../PriceTag";
import { Button } from "../Button";

export interface ActionBarProps {
  price?: number;
  currency?: string;
  onContact?: () => void;
  onCall?: () => void;
  onChat?: () => void;
  className?: string;
}

export function ActionBar({ price, currency = "UGX", onContact, onCall, onChat, className = "" }: ActionBarProps) {
  return (
    <SafeAreaView className="bg-card border-t border-border/40 shadow-lg">
      <View className={`flex-row items-center justify-between px-4 py-3 gap-3 ${className}`}>
        {price !== undefined ? (
          <PriceTag amount={price} currency={currency} size="lg" />
        ) : null}
        <View className="flex-row gap-2 flex-1 justify-end">
          {onCall ? (
            <Pressable
              onPress={onCall}
              className="w-10 h-10 items-center justify-center bg-surface border border-border/40 rounded-button"
              accessibilityLabel="Call seller"
            >
              <Text className="text-base">📞</Text>
            </Pressable>
          ) : null}
          {onChat ? (
            <Pressable
              onPress={onChat}
              className="w-10 h-10 items-center justify-center bg-surface border border-border/40 rounded-button"
              accessibilityLabel="Chat with seller"
            >
              <Text className="text-base">💬</Text>
            </Pressable>
          ) : null}
          {onContact ? (
            <Button onPress={onContact} variant="primary" size="md" className="flex-1">
              Contact Seller
            </Button>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
