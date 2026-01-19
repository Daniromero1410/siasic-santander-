// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander Frontend - Utilidades
// ═══════════════════════════════════════════════════════════════════════════

import { TipoProfundidad } from "@/types";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function getColorByDepthType(tipo: TipoProfundidad): string {
  const colors: Record<TipoProfundidad, string> = {
    Superficial: "#DC2626",
    Intermedio: "#F59E0B",
    "Nido Sísmico": "#6B46C1",
    Profundo: "#2563EB",
  };
  return colors[tipo] || "#888888";
}

export function getBadgeClass(tipo: TipoProfundidad): string {
  const classes: Record<TipoProfundidad, string> = {
    Superficial: "badge-superficial",
    Intermedio: "badge-intermedio",
    "Nido Sísmico": "badge-nido",
    Profundo: "badge-profundo",
  };
  return classes[tipo] || "";
}

export function clasificarProfundidad(profundidad: number): TipoProfundidad {
  if (profundidad < 70) return "Superficial";
  if (profundidad < 140) return "Intermedio";
  if (profundidad <= 180) return "Nido Sísmico";
  return "Profundo";
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "hace unos segundos";
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 2592000) return `hace ${Math.floor(seconds / 86400)} días`;
  return formatDate(dateString);
}

export function getMagnitudeColor(magnitud: number): string {
  if (magnitud < 3) return "#22C55E";
  if (magnitud < 4) return "#84CC16";
  if (magnitud < 5) return "#EAB308";
  if (magnitud < 6) return "#F97316";
  return "#EF4444";
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}