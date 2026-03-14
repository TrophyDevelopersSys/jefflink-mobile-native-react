import React from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

export function StatsCard({ label, value, sub, trend, icon }: StatsCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-500"
      : "text-[var(--color-text-muted)]";

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)] font-medium">{label}</span>
        {icon && <span className="text-2xl opacity-70">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      {sub && (
        <p className={`text-xs font-medium ${trendColor}`}>{sub}</p>
      )}
    </div>
  );
}
