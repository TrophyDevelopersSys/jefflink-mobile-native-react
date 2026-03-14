import React from "react";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex border-b border-border/40 overflow-x-auto ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive ? "true" : "false"}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              isActive
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-text-muted hover:text-text hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
