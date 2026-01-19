// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Mapa Interactivo del Dashboard
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface SismoMapa {
  id: number;
  latitud: number;
  longitud: number;
  magnitud: number;
  profundidad: number;
  tipo_profundidad: string;
  municipio: string;
  fecha_hora: string;
}

interface DashboardMapProps {
  sismos: SismoMapa[];
  height?: string;
}

export default function DashboardMap({ sismos, height = "400px" }: DashboardMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || sismos.length === 0) return;

    // Si ya existe un mapa, destruirlo
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Crear el mapa centrado en Santander
    const map = L.map(mapContainerRef.current, {
      center: [6.85, -73.15],
      zoom: 8,
      zoomControl: true,
    });

    mapRef.current = map;

    // Capa base oscura
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Colores por tipo de profundidad
    const getColor = (tipo: string) => {
      switch (tipo) {
        case "Superficial": return "#DC2626";
        case "Intermedio": return "#F59E0B";
        case "Nido Sísmico": return "#6B46C1";
        case "Profundo": return "#2563EB";
        default: return "#666666";
      }
    };

    // Tamaño basado en magnitud
    const getRadius = (magnitud: number) => {
      if (magnitud >= 5) return 12;
      if (magnitud >= 4) return 9;
      if (magnitud >= 3) return 6;
      return 4;
    };

    // Agregar marcadores
    sismos.forEach((sismo) => {
      if (!sismo.latitud || !sismo.longitud) return;

      const color = getColor(sismo.tipo_profundidad);
      const radius = getRadius(sismo.magnitud);

      L.circleMarker([sismo.latitud, sismo.longitud], {
        radius: radius,
        fillColor: color,
        color: "#fff",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 180px; font-family: system-ui;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: ${color};">
              M${sismo.magnitud.toFixed(1)} - ${sismo.tipo_profundidad}
            </div>
            <div style="font-size: 12px; color: #333;">
              <div style="margin-bottom: 4px;">📍 ${sismo.municipio || 'N/A'}</div>
              <div style="margin-bottom: 4px;">📏 Prof: ${sismo.profundidad.toFixed(1)} km</div>
              <div>📅 ${new Date(sismo.fecha_hora).toLocaleDateString('es-CO')}</div>
            </div>
          </div>
        `);
    });

    // Área del Nido Sísmico
    L.circle([6.78, -73.18], {
      radius: 30000,
      color: "#6B46C1",
      fillColor: "#6B46C1",
      fillOpacity: 0.1,
      weight: 2,
      dashArray: "5, 5",
    })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; font-family: system-ui;">
          <strong style="color: #6B46C1;">Zona del Nido Sísmico</strong><br/>
          <small>Profundidad: 140-180 km</small>
        </div>
      `);

    // Leyenda
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <div style="
          background: rgba(10, 22, 40, 0.95);
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 170, 0.3);
          font-size: 11px;
          color: white;
        ">
          <strong style="display: block; margin-bottom: 6px; color: #00d4aa;">Tipo</strong>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <div style="width: 10px; height: 10px; background: #6B46C1; border-radius: 50%;"></div>
            <span>Nido Sísmico</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <div style="width: 10px; height: 10px; background: #DC2626; border-radius: 50%;"></div>
            <span>Superficial</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <div style="width: 10px; height: 10px; background: #F59E0B; border-radius: 50%;"></div>
            <span>Intermedio</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 10px; height: 10px; background: #2563EB; border-radius: 50%;"></div>
            <span>Profundo</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sismos]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
}