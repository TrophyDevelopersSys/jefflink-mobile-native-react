import React, { useState } from "react";
import { Select } from "../Select";
import type { SelectOption } from "../Select";

export interface FilterField {
  key: string;
  label: string;
  options: SelectOption[];
  value?: string;
}

export interface FilterPanelProps {
  filters: FilterField[];
  onFilterChange: (key: string, value: string) => void;
  onReset?: () => void;
  collapsible?: boolean;
  className?: string;
}

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  collapsible = false,
  className = "",
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <div className={`bg-surface border border-border/40 rounded-card ${className}`}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text"
        >
          <span>Filters</span>
          <span className="text-text-muted text-xs">{expanded ? "▴" : "▾"}</span>
        </button>
      ) : (
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-semibold text-text">Filters</p>
        </div>
      )}

      {expanded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-4 pb-4">
          {filters.map((f) => (
            <Select
              key={f.key}
              label={f.label}
              options={f.options}
              value={f.value}
              onChange={(val) => onFilterChange(f.key, val)}
            />
          ))}
          {onReset ? (
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-brand-danger hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
