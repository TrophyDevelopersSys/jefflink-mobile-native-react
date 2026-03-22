"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-6 sm:p-8",
};

function Card({
  padding = "md",
  hoverable = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        "bg-card border border-border rounded-card",
        paddingClasses[padding],
        hoverable
          ? "transition-shadow hover:shadow-lg hover:border-brand-primary/30"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        {description && (
          <p className="text-sm text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export { Card, CardHeader };
export type { CardProps, CardHeaderProps };
