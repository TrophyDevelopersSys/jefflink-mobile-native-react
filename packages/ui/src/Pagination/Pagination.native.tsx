import React from "react";
import { View, Text, Pressable } from "react-native";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <View className={`flex-row items-center justify-center gap-1 ${className}`}>
      <Pressable
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-9 h-9 items-center justify-center rounded-full ${currentPage === 1 ? "opacity-30" : "bg-surface border border-border/40"}`}
      >
        <Text className="text-text text-sm">‹</Text>
      </Pressable>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Pressable
          key={page}
          onPress={() => onPageChange(page)}
          className={`w-9 h-9 items-center justify-center rounded-full ${
            page === currentPage ? "bg-brand-primary" : "bg-surface border border-border/40"
          }`}
        >
          <Text className={`text-sm font-medium ${page === currentPage ? "text-white" : "text-text"}`}>
            {page}
          </Text>
        </Pressable>
      ))}

      <Pressable
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 items-center justify-center rounded-full ${currentPage === totalPages ? "opacity-30" : "bg-surface border border-border/40"}`}
      >
        <Text className="text-text text-sm">›</Text>
      </Pressable>
    </View>
  );
}
