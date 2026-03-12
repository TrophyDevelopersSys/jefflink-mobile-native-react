import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  onPress?: () => void; // alias for cross-platform compatibility
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-brand-primary text-white hover:bg-brand-primary/90",
  secondary: "bg-brand-slate text-white border border-brand-muted/30 hover:bg-brand-slate/80",
  danger:    "bg-brand-danger text-white hover:bg-brand-danger/90",
  ghost:     "bg-transparent text-white border border-brand-muted/30 hover:bg-white/5",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

export function Button({
  children,
  onClick,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick ?? onPress}
      disabled={isDisabled}
      className={`
        rounded-button font-semibold inline-flex items-center justify-center gap-2
        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-primary/50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `.trim()}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
