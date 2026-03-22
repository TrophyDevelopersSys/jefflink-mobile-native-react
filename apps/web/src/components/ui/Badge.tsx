"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "primary";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-card border border-border text-text-muted",
  success: "bg-brand-success/15 text-brand-success border border-brand-success/30",
  warning: "bg-brand-warning/15 text-brand-warning border border-brand-warning/30",
  danger: "bg-brand-danger/15 text-brand-danger border border-brand-danger/30",
  info: "bg-brand-blue/15 text-brand-blue border border-brand-blue/30",
  primary: "bg-brand-primary/15 text-brand-primary border border-brand-primary/30",
};

function Badge({ variant = "default", icon: Icon, children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant };
