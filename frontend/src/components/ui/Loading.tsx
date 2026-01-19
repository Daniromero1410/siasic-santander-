// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Loading
// ═══════════════════════════════════════════════════════════════════════════

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeStyles = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function Loading({ size = "md", text }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeStyles[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-siasic-bg-secondary"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-siasic-accent-cyan animate-spin"></div>
      </div>
      {text && (
        <p className="text-siasic-text-secondary text-sm">{text}</p>
      )}
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-siasic-bg-primary">
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-4 text-siasic-text-secondary">Cargando SIASIC-Santander...</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-siasic-bg-secondary rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-siasic-bg-secondary rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-siasic-bg-secondary rounded w-2/3"></div>
    </div>
  );
}