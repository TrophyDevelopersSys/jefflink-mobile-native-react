import React from "react";

export interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantClasses = {
  default: "bg-brand-muted/20 text-brand-muted",
  success: "bg-brand-success/20 text-brand-success",
  warning: "bg-brand-warning/20 text-brand-warning",
  danger:  "bg-brand-danger/20 text-brand-danger",
  info:    "bg-blue-500/20 text-blue-400",
};

export function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
