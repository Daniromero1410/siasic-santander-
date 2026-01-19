// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Mapa del Nido Sísmico
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Sismo } from "@/types";

interface NidoMapProps {
  sismos: Sismo[];
}

export default function NidoMap({ sismos }: NidoMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Centrar en el epicentro del Nido
    const map = L.map(mapContainerRef.current, {
      center: [6.78, -73.18],
      zoom: 10,
    });

    mapRef.current = map;

    // Capa base oscura
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OSM',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Zona del Nido Sísmico (círculo principal)
    L.circle([6.78, -73.18], {
      radius: 25000,
      color: "#6B46C1",
      fillColor: "#6B46C1",
      fillOpacity: 0.15,
      weight: 3,
    })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; font-family: system-ui;">
          <strong style="color: #6B46C1; font-size: 16px;">Zona del Nido Sísmico</strong><br/>
          <span>Profundidad: 140-180 km</span><br/>
          <span>Centro: 6.78°N, 73.18°W</span>
        </div>
      `);

    // Epicentro central
    const epicentroIcon = L.divIcon({
      className: "nido-epicentro",
      html: `
        <div style="position: relative; width: 30px; height: 30px;">
          <div style="
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 30px; height: 30px;
            background: rgba(107, 70, 193, 0.4);
            border-radius: 50%;
            animation: pulse 2s ease-out infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 14px; height: 14px;
            background: #6B46C1;
            border: 2px solid white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    L.marker([6.78, -73.18], { icon: epicentroIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center;">
          <strong style="color: #6B46C1;">Epicentro del Nido</strong><br/>
          <small>6.78°N, 73.18°W</small>
        </div>
      `);

    // Agregar sismos con gradiente de color por profundidad
    sismos.forEach((sismo) => {
      if (!sismo.latitud || !sismo.longitud) return;

      // Color basado en profundidad dentro del rango del nido
      const profNorm = (sismo.profundidad - 140) / 40; // 0 a 1
      const hue = 270 - profNorm * 30; // 270 (púrpura) a 240 (azul)
      const color = `hsl(${hue}, 70%, 50%)`;

      const radius = Math.max(3, sismo.magnitud * 1.5);

      L.circleMarker([sismo.latitud, sismo.longitud], {
        radius: radius,
        fillColor: color,
        color: "#fff",
        weight: 0.5,
        opacity: 0.8,
        fillOpacity: 0.6,
      })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; min-width: 150px;">
            <div style="font-weight: bold; color: #6B46C1; margin-bottom: 6px;">
              M${sismo.magnitud.toFixed(1)}
            </div>
            <div style="font-size: 12px; color: #333;">
              <div>📍 ${sismo.municipio || "N/A"}</div>
              <div>📏 ${sismo.profundidad.toFixed(1)} km</div>
              <div>📅 ${new Date(sismo.fecha_hora).toLocaleDateString("es-CO")}</div>
            </div>
          </div>
        `);
    });

    // Leyenda
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="
          background: rgba(10, 22, 40, 0.95);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #6B46C1;
          font-size: 11px;
          color: white;
        ">
          <strong style="color: #6B46C1; display: block; margin-bottom: 8px;">
            Nido Sísmico
          </strong>
          <div style="margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: hsl(270, 70%, 50%); border-radius: 50%; margin-right: 6px;"></span>
            140 km
          </div>
          <div style="margin-bottom: 4px;">
            <span style="display: inline-block; width: 10px; height: 10px; background: hsl(255, 70%, 50%); border-radius: 50%; margin-right: 6px;"></span>
            160 km
          </div>
          <div>
            <span style="display: inline-block; width: 10px; height: 10px; background: hsl(240, 70%, 50%); border-radius: 50%; margin-right: 6px;"></span>
            180 km
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

  return <div ref={mapContainerRef} className="w-full h-full" />;
}