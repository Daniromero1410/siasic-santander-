// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Badge
// ═══════════════════════════════════════════════════════════════════════════

import { TipoProfundidad } from "@/types";

interface BadgeProps {
  tipo: TipoProfundidad;
  size?: "sm" | "md" | "lg";
}

const badgeStyles: Record<TipoProfundidad, string> = {
  "Superficial": "bg-siasic-superficial/20 text-siasic-superficial border-siasic-superficial/30",
  "Intermedio": "bg-siasic-intermedio/20 text-siasic-intermedio border-siasic-intermedio/30",
  "Nido Sísmico": "bg-siasic-nido/20 text-siasic-nido border-siasic-nido/30",
  "Profundo": "bg-siasic-profundo/20 text-siasic-profundo border-siasic-profundo/30",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function Badge({ tipo, size = "md" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${badgeStyles[tipo]}
        ${sizeStyles[size]}
      `}
    >
      {tipo}
    </span>
  );
}

interface StatusBadgeProps {
  status: "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

const statusStyles = {
  success: "bg-siasic-success/20 text-siasic-success border-siasic-success/30",
  warning: "bg-siasic-warning/20 text-siasic-warning border-siasic-warning/30",
  danger: "bg-siasic-danger/20 text-siasic-danger border-siasic-danger/30",
  info: "bg-siasic-info/20 text-siasic-info border-siasic-info/30",
};

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium
        ${statusStyles[status]}
      `}
    >
      {children}
    </span>
  );
}