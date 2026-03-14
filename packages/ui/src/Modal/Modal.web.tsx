"use client";
import React, { useEffect } from "react";

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({ visible, onClose, title, children, showCloseButton = true, className = "" }: ModalProps) {
  // Trap focus and prevent body scroll when modal is open
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        className={`relative bg-card rounded-card shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) ? (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 flex-shrink-0">
            {title ? <h2 className="text-base font-semibold text-text">{title}</h2> : <div />}
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text transition-colors p-1"
                aria-label="Close"
              >
                ✕
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Content */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
