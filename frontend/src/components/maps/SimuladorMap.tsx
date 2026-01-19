// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Mapa del Simulador con Leaflet
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SimuladorOutput } from "@/types";

interface SimuladorMapProps {
  resultado: SimuladorOutput;
}

export default function SimuladorMap({ resultado }: SimuladorMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !resultado) return;

    // Si ya existe un mapa, destruirlo
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Crear el mapa
    const map = L.map(mapContainerRef.current, {
      center: [resultado.epicentro.lat, resultado.epicentro.lon],
      zoom: 9,
      zoomControl: true,
    });

    mapRef.current = map;

    // Capa base oscura
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // ═══════════════════════════════════════════════════════════════════
    // ZONAS DE IMPACTO (círculos)
    // ═══════════════════════════════════════════════════════════════════
    resultado.zonas.forEach((zona) => {
      L.circle([resultado.epicentro.lat, resultado.epicentro.lon], {
        radius: zona.radio_km * 1000, // Convertir km a metros
        color: zona.color,
        fillColor: zona.color,
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.8,
      })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <strong style="color: ${zona.color};">${zona.nombre}</strong><br/>
            <span>Radio: ${zona.radio_km} km</span><br/>
            <span>Intensidad: ${zona.intensidad}</span><br/>
            <small>${zona.descripcion}</small>
          </div>
        `);
    });

    // ═══════════════════════════════════════════════════════════════════
    // EPICENTRO
    // ═══════════════════════════════════════════════════════════════════
    const epicentroIcon = L.divIcon({
      className: "custom-epicentro-icon",
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
        ">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background: rgba(107, 70, 193, 0.3);
            border-radius: 50%;
            animation: pulse-ring 1.5s ease-out infinite;
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: #6B46C1;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(107, 70, 193, 0.8);
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([resultado.epicentro.lat, resultado.epicentro.lon], {
      icon: epicentroIcon,
    })
      .addTo(map)
      .bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <strong style="color: #6B46C1; font-size: 16px;">⚡ EPICENTRO</strong><br/><br/>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left;">
            <span><strong>Magnitud:</strong></span>
            <span style="color: #00d4aa;">M${resultado.magnitud.toFixed(1)}</span>
            <span><strong>Profundidad:</strong></span>
            <span>${resultado.profundidad} km</span>
            <span><strong>Tipo:</strong></span>
            <span style="color: #6B46C1;">${resultado.tipo_profundidad}</span>
            <span><strong>Intensidad:</strong></span>
            <span>${resultado.mercalli}</span>
          </div>
          <br/>
          <small style="color: #888;">
            ${resultado.epicentro.lat.toFixed(4)}°N, ${Math.abs(resultado.epicentro.lon).toFixed(4)}°W
          </small>
        </div>
      `)
      .openPopup();

    // ═══════════════════════════════════════════════════════════════════
    // CIUDADES AFECTADAS
    // ═══════════════════════════════════════════════════════════════════
    
    // Coordenadas aproximadas de ciudades de Santander
    const coordenadasCiudades: Record<string, [number, number]> = {
      "Bucaramanga": [7.1254, -73.1198],
      "Floridablanca": [7.0622, -73.0861],
      "Girón": [7.0683, -73.1689],
      "Piedecuesta": [6.9847, -73.0522],
      "San Gil": [6.5594, -73.1369],
      "Barrancabermeja": [7.0653, -73.8547],
      "Socorro": [6.4656, -73.2617],
      "Barbosa": [5.9319, -73.6156],
      "Vélez": [6.0128, -73.6742],
      "Málaga": [6.7056, -72.7333],
      "Cúcuta": [7.8939, -72.5078],
      "Pamplona": [7.3753, -72.6481],
      "Ocaña": [8.2378, -73.3544],
    };

    resultado.ciudades_afectadas.forEach((ciudad) => {
      const coords = coordenadasCiudades[ciudad.ciudad];
      if (!coords) return;

      // Color basado en intensidad
      const getColorByIntensity = (intensidad: number) => {
        if (intensidad >= 7) return "#DC2626";
        if (intensidad >= 5) return "#F97316";
        if (intensidad >= 3) return "#FBBF24";
        return "#22C55E";
      };

      const color = getColorByIntensity(ciudad.intensidad);

      const cityIcon = L.divIcon({
        className: "custom-city-icon",
        html: `
          <div style="
            width: 14px;
            height: 14px;
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 0 6px ${color};
          "></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(coords, { icon: cityIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <strong style="font-size: 14px;">${ciudad.ciudad}</strong><br/><br/>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; text-align: left; font-size: 12px;">
              <span>Distancia:</span>
              <span><strong>${ciudad.distancia_km.toFixed(1)} km</strong></span>
              <span>Intensidad:</span>
              <span style="color: ${color};"><strong>${ciudad.intensidad.toFixed(1)}</strong></span>
              <span>Mercalli:</span>
              <span><strong>${ciudad.mercalli}</strong></span>
              <span>Población:</span>
              <span>${ciudad.poblacion.toLocaleString()}</span>
            </div>
          </div>
        `);
    });

    // ═══════════════════════════════════════════════════════════════════
    // LEYENDA
    // ═══════════════════════════════════════════════════════════════════
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = `
        <div style="
          background: rgba(10, 22, 40, 0.95);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 170, 0.3);
          font-size: 11px;
          color: white;
          min-width: 120px;
        ">
          <strong style="display: block; margin-bottom: 8px; color: #00d4aa;">Leyenda</strong>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 12px; height: 12px; background: #6B46C1; border-radius: 50%; border: 2px solid white;"></div>
            <span>Epicentro</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 12px; height: 12px; background: #22C55E; border-radius: 50%;"></div>
            <span>Leve</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 12px; height: 12px; background: #FBBF24; border-radius: 50%;"></div>
            <span>Moderado</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="width: 12px; height: 12px; background: #F97316; border-radius: 50%;"></div>
            <span>Fuerte</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 12px; height: 12px; background: #DC2626; border-radius: 50%;"></div>
            <span>Severo</span>
          </div>
        </div>
      `;
      return div;
    };

    legend.addTo(map);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [resultado]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
}