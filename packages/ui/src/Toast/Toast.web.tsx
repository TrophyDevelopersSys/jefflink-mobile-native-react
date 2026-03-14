"use client";
import React, { useEffect } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-brand-success text-white",
  error:   "bg-brand-danger text-white",
  warning: "bg-brand-warning text-white",
  info:    "bg-blue-500 text-white",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

export function Toast({ message, variant = "success", visible, onHide, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onHide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-card shadow-lg min-w-[280px] transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      } ${variantClasses[variant]}`}
    >
      <span className="text-base font-bold">{variantIcons[variant]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        type="button"
        onClick={onHide}
        className="ml-2 text-white/70 hover:text-white transition-colors text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
