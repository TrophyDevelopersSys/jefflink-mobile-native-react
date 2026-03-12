import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  className?: string;
}

export function StatCard({ label, value, delta, positive, className = "" }: StatCardProps) {
  return (
    <div className={`bg-brand-slate rounded-card p-4 flex-1 ${className}`}>
      <p className="text-brand-muted text-xs mb-1">{label}</p>
      <p className="text-white text-xl font-semibold">{String(value)}</p>
      {delta !== undefined && (
        <p
          className={`text-xs mt-1 font-medium ${
            positive ? "text-brand-success" : "text-brand-danger"
          }`}
        >
          {positive ? "+" : ""}{delta}
        </p>
      )}
    </div>
  );
}
