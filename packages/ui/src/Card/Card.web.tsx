import React from "react";

export interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  const base = `bg-card rounded-card overflow-hidden border border-border/40 ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} w-full text-left cursor-pointer hover:border-brand-primary/30 transition-colors`}
      >
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}
