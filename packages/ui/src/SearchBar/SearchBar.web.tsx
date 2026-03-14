import React from "react";
import { Select } from "../Select";
import type { SelectOption } from "../Select";

export interface SearchFilter {
  key: string;
  label: string;
  options: SelectOption[];
  value?: string;
}

export interface SearchBarProps {
  filters?: SearchFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  filters = [],
  onFilterChange,
  onSearch,
  searchPlaceholder = "Search listings…",
  searchValue = "",
  onSearchChange,
  className = "",
}: SearchBarProps) {
  return (
    <div className={`flex items-end gap-3 flex-wrap ${className}`}>
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[140px]">
          <Select
            placeholder={filter.label}
            options={filter.options}
            value={filter.value}
            onChange={(val) => onFilterChange?.(filter.key, val)}
          />
        </div>
      ))}

      <div className="flex flex-1 min-w-[200px] items-center bg-surface border border-border rounded-input px-3 gap-2 focus-within:ring-2 focus-within:ring-brand-primary/40">
        <span className="text-text-muted text-sm">🔍</span>
        <input
          type="search"
          className="flex-1 py-3 text-sm bg-transparent text-text placeholder-text-muted outline-none"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearch?.(); }}
        />
      </div>

      <button
        type="button"
        onClick={onSearch}
        className="bg-brand-primary text-white px-5 py-3 rounded-input text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
      >
        Search
      </button>
    </div>
  );
}
