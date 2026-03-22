"use client";

import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-brand-white hover:bg-brand-primary/90 active:bg-brand-primary/80",
  secondary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark active:bg-brand-blue-dark/90",
  outline:
    "bg-transparent border border-border text-text hover:bg-surface active:bg-card",
  ghost:
    "bg-transparent text-text-muted hover:text-text hover:bg-surface active:bg-card",
  danger:
    "bg-brand-danger text-white hover:bg-brand-danger/90 active:bg-brand-danger/80",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconRight: IconRight,
      loading,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50",
          variantClasses[variant],
          sizeClasses[size],
          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        ].join(" ")}
        {...rest}
      >
        {loading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : Icon ? (
          <Icon size={iconSizes[size]} />
        ) : null}
        {children}
        {!loading && IconRight && <IconRight size={iconSizes[size]} />}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
