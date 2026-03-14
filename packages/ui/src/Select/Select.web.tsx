import React from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function Select({
  label,
  placeholder = "Select…",
  options,
  value,
  onChange,
  error,
  className = "",
}: SelectProps) {
  const id = label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`bg-surface border rounded-input px-3 py-3 text-sm text-text appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary/40 ${
          error ? "border-brand-danger" : "border-border"
        } ${!value ? "text-text-muted" : ""}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-brand-danger">{error}</p> : null}
    </div>
  );
}
