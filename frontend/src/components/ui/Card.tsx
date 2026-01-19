// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Card
// ═══════════════════════════════════════════════════════════════════════════

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6
        shadow-lg transition-all duration-300
        ${hover ? "hover:shadow-xl hover:border-siasic-accent-cyan/30" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-siasic-text-primary ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}