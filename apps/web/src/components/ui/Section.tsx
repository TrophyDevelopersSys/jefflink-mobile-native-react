"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface SectionProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function Section({
  title,
  description,
  icon: Icon,
  action,
  className = "",
  children,
}: SectionProps) {
  return (
    <section className={["space-y-4", className].join(" ")}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-input bg-brand-primary/10 text-brand-primary">
                <Icon size={16} />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-text">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-text-muted">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export { Section };
export type { SectionProps };
