// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - ArcGIS Dashboard
// ═══════════════════════════════════════════════════════════════════════════

import { ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ArcGISPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-siasic-text-muted hover:text-siasic-accent-cyan mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-siasic-text-primary mb-2">
            Dashboard ArcGIS Online
          </h1>
          <p className="text-siasic-text-secondary">
            Visualización geoespacial interactiva del Nido Sísmico de Bucaramanga
          </p>
        </div>

        {/* ArcGIS Embed */}
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-2xl overflow-hidden">
          <div className="aspect-video w-full min-h-[600px]">
            <iframe
              src="https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022"
              className="w-full h-full border-0"
              title="SIASIC-Santander ArcGIS Dashboard"
              allowFullScreen
            />
          </div>
          <div className="p-4 border-t border-siasic-bg-secondary flex justify-between items-center">
            <span className="text-siasic-text-muted text-sm">
              Sistema de Visualización y Monitoreo Sísmico - Santander
            </span>
            <a 
              href="https://udes.maps.arcgis.com/apps/dashboards/2d52631707104b1c9239a9eac929b022"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-siasic-accent-cyan text-sm hover:underline"
            >
              Abrir en pantalla completa
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
            <h3 className="text-siasic-text-primary font-semibold mb-2">Total de Eventos</h3>
            <p className="text-siasic-text-muted text-sm">
              El dashboard muestra más de 6,000 eventos sísmicos registrados en la región.
            </p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
            <h3 className="text-siasic-text-primary font-semibold mb-2">Filtros Interactivos</h3>
            <p className="text-siasic-text-muted text-sm">
              Filtra por magnitud, profundidad, fecha y ubicación directamente en el mapa.
            </p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
            <h3 className="text-siasic-text-primary font-semibold mb-2">Datos Actualizados</h3>
            <p className="text-siasic-text-muted text-sm">
              Información proveniente del Servicio Geológico Colombiano (SGC).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}