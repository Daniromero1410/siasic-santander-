// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Componente Footer
// ═══════════════════════════════════════════════════════════════════════════

import { Activity, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-siasic-bg-secondary border-t border-siasic-bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-siasic-accent-cyan rounded-lg flex items-center justify-center">
                <Activity className="text-siasic-bg-primary" size={18} />
              </div>
              <span className="text-lg font-bold text-siasic-text-primary">
                SIASIC<span className="text-siasic-accent-cyan">-Santander</span>
              </span>
            </div>
            <p className="text-siasic-text-secondary text-sm">
              Sistema de Información y Análisis Sísmico de Santander. 
              Monitoreo y análisis del Nido Sísmico de Bucaramanga.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-siasic-text-primary font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.sgc.gov.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-siasic-text-secondary hover:text-siasic-accent-cyan flex items-center gap-2 text-sm"
                >
                  <ExternalLink size={14} />
                  Servicio Geológico Colombiano
                </a>
              </li>
              <li>
                <a 
                  href="https://www.udes.edu.co" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-siasic-text-secondary hover:text-siasic-accent-cyan flex items-center gap-2 text-sm"
                >
                  <ExternalLink size={14} />
                  Universidad de Santander
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-siasic-text-primary font-semibold mb-4">Proyecto</h4>
            <p className="text-siasic-text-secondary text-sm mb-2">
              Trabajo de Grado - Ingeniería de Software
            </p>
            <p className="text-siasic-text-muted text-sm">
              Universidad de Santander (UDES)
            </p>
            <p className="text-siasic-text-muted text-sm">
              2024 - 2025
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-siasic-bg-card mt-8 pt-6 text-center">
          <p className="text-siasic-text-muted text-sm">
            © 2025 SIASIC-Santander. Desarrollado por Daniel Romero.
          </p>
        </div>
      </div>
    </footer>
  );
}