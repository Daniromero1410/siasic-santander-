// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Button
// ═══════════════════════════════════════════════════════════════════════════

import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantStyles = {
  primary: "bg-siasic-accent-cyan text-siasic-bg-primary hover:bg-siasic-accent-cyan/90",
  secondary: "bg-siasic-bg-secondary text-siasic-text-primary border border-siasic-accent-cyan/30 hover:border-siasic-accent-cyan",
  danger: "bg-siasic-danger text-white hover:bg-siasic-danger/90",
  ghost: "bg-transparent text-siasic-text-primary hover:bg-siasic-bg-secondary",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 16 : 20} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 16 : 20} />}
        </>
      )}
    </button>
  );
}