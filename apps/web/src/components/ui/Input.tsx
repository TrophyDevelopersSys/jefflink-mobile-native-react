"use client";

import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon: Icon, className = "", id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full bg-card border rounded-input px-3 py-2 text-sm text-text placeholder:text-text-muted transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary",
              error ? "border-brand-danger" : "border-border",
              Icon ? "pl-9" : "",
              className,
            ].join(" ")}
            {...rest}
          />
        </div>
        {error && <p className="text-xs text-brand-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
