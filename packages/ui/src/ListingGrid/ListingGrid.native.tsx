import React from "react";
import { FlatList, View, Text } from "react-native";

export interface ListingGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  columns?: 1 | 2;
  emptyMessage?: string;
  className?: string;
}

export function ListingGrid<T>({
  data,
  renderItem,
  keyExtractor,
  columns = 1,
  emptyMessage = "No listings found.",
  className = "",
}: ListingGridProps<T>) {
  if (data.length === 0) {
    return (
      <View className={`flex-1 items-center justify-center py-16 ${className}`}>
        <Text className="text-text-muted text-sm">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      key={columns}
      numColumns={columns}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <View className={columns === 2 ? "flex-1 p-1" : "mb-3"}>
          {renderItem(item, index)}
        </View>
      )}
      columnWrapperStyle={columns === 2 ? { gap: 8 } : undefined}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      className={className}
    />
  );
}
