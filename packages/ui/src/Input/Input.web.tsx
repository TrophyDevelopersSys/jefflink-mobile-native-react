import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  wrapperClassName = "",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-muted uppercase tracking-wide"
        >
          {label}
        </label>
      ) : null}
      <div
        className={`flex items-center bg-surface border rounded-input px-3 gap-2 focus-within:ring-2 focus-within:ring-brand-primary/40 ${
          error ? "border-brand-danger" : "border-border"
        }`}
      >
        {leftIcon}
        <input
          id={inputId}
          className={`flex-1 py-3 text-sm bg-transparent text-text placeholder-text-muted outline-none ${className}`}
          {...props}
        />
        {rightIcon}
      </div>
      {error ? <p className="text-xs text-brand-danger">{error}</p> : null}
    </div>
  );
}
