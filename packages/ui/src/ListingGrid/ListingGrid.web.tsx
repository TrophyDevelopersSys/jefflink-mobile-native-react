import React from "react";

export interface ListingGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T) => string;
  columns?: 1 | 2 | 3 | 4;
  emptyMessage?: string;
  className?: string;
}

const colClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export function ListingGrid<T>({
  data,
  renderItem,
  keyExtractor,
  columns = 3,
  emptyMessage = "No listings found.",
  className = "",
}: ListingGridProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClasses[columns]} gap-4 ${className}`}>
      {data.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
