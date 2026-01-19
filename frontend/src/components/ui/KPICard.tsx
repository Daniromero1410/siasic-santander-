// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente KPI Card
// ═══════════════════════════════════════════════════════════════════════════

import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "cyan" | "purple" | "red" | "orange" | "blue" | "green";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  cyan: "text-siasic-accent-cyan bg-siasic-accent-cyan/10 border-siasic-accent-cyan/30",
  purple: "text-siasic-nido bg-siasic-nido/10 border-siasic-nido/30",
  red: "text-siasic-superficial bg-siasic-superficial/10 border-siasic-superficial/30",
  orange: "text-siasic-intermedio bg-siasic-intermedio/10 border-siasic-intermedio/30",
  blue: "text-siasic-profundo bg-siasic-profundo/10 border-siasic-profundo/30",
  green: "text-siasic-success bg-siasic-success/10 border-siasic-success/30",
};

export function KPICard({ title, value, subtitle, icon: Icon, color = "cyan", trend }: KPICardProps) {
  return (
    <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 hover:border-siasic-accent-cyan/30 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-siasic-text-secondary text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-siasic-text-primary mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-siasic-text-muted text-sm">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-siasic-success" : "text-siasic-danger"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}