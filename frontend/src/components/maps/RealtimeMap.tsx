// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Mapa de Sismos en Tiempo Real
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useRef, useState } from "react";

interface SismoRealTime {
  id: string;
  magnitud: number;
  lugar: string;
  fecha: Date;
  latitud: number;
  longitud: number;
  profundidad: number;
  tsunami: boolean;
}

interface RealtimeMapProps {
  sismos: SismoRealTime[];
  sismoSeleccionado: SismoRealTime | null;
  onSelectSismo: (sismo: SismoRealTime | null) => void;
  region: "world" | "colombia" | "suramerica";
}

export default function RealtimeMap({
  sismos,
  sismoSeleccionado,
  onSelectSismo,
  region,
}: RealtimeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Configuracion de vista por region
  const regionConfig = {
    colombia: { center: [4.5, -74.0] as [number, number], zoom: 6 },
    suramerica: { center: [-15, -60] as [number, number], zoom: 3 },
    world: { center: [20, 0] as [number, number], zoom: 2 },
  };

  // Cargar Leaflet solo en cliente
  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!isClient || !L || !mapContainerRef.current) return;

    // Importar CSS de Leaflet
    import("leaflet/dist/leaflet.css");

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const config = regionConfig[region];

    const map = L.map(mapContainerRef.current, {
      center: config.center,
      zoom: config.zoom,
      zoomControl: true,
    });

    mapRef.current = map;

    // Capa base oscura
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Layer group para marcadores
    markersRef.current = L.layerGroup().addTo(map);

    // Limites de Colombia
    if (region === "colombia") {
      L.rectangle(
        [
          [-4.5, -82],
          [13.5, -66],
        ],
        {
          color: "#00d4aa",
          weight: 1,
          fillOpacity: 0.05,
          dashArray: "5, 5",
        }
      ).addTo(map);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient, L, region]);

  // Actualizar marcadores cuando cambian los sismos
  useEffect(() => {
    if (!isClient || !L || !mapRef.current || !markersRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.clearLayers();

    // Funcion para obtener color por magnitud
    const getColor = (mag: number): string => {
      if (mag >= 6) return "#DC2626";
      if (mag >= 5) return "#F97316";
      if (mag >= 4) return "#FBBF24";
      if (mag >= 3) return "#84CC16";
      return "#22C55E";
    };

    // Funcion para obtener radio por magnitud
    const getRadius = (mag: number): number => {
      if (mag >= 6) return 15;
      if (mag >= 5) return 12;
      if (mag >= 4) return 9;
      if (mag >= 3) return 6;
      return 4;
    };

    // Agregar marcadores
    sismos.forEach((sismo) => {
      const color = getColor(sismo.magnitud);
      const radius = getRadius(sismo.magnitud);
      const isSelected = sismoSeleccionado?.id === sismo.id;

      const marker = L.circleMarker([sismo.latitud, sismo.longitud], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: color,
        color: isSelected ? "#fff" : color,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        fillOpacity: 0.7,
      });

      const fechaStr = sismo.fecha instanceof Date 
        ? sismo.fecha.toLocaleString("es-CO") 
        : new Date(sismo.fecha).toLocaleString("es-CO");

      marker.bindPopup(
        '<div style="min-width: 200px; font-family: system-ui;">' +
          '<div style="font-weight: bold; font-size: 16px; color: ' + color + '; margin-bottom: 8px;">' +
            'M' + sismo.magnitud.toFixed(1) +
          '</div>' +
          '<div style="font-size: 12px; color: #333;">' +
            '<div style="margin-bottom: 4px;"><strong>Ubicacion:</strong> ' + sismo.lugar + '</div>' +
            '<div style="margin-bottom: 4px;"><strong>Profundidad:</strong> ' + sismo.profundidad.toFixed(1) + ' km</div>' +
            '<div style="margin-bottom: 4px;"><strong>Fecha:</strong> ' + fechaStr + '</div>' +
            (sismo.tsunami ? '<div style="color: #DC2626; font-weight: bold;">Alerta de Tsunami</div>' : '') +
          '</div>' +
        '</div>'
      );

      marker.on("click", () => {
        onSelectSismo(sismo);
      });

      markersRef.current?.addLayer(marker);
    });

    // Pulso al sismo mas reciente
    if (sismos.length > 0) {
      const ultimoSismo = sismos[0];
      const pulseIcon = L.divIcon({
        className: "pulse-icon",
        html: '<div style="position: relative; width: 30px; height: 30px;">' +
          '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; background: rgba(220, 38, 38, 0.4); border-radius: 50%; animation: pulse 2s ease-out infinite;"></div>' +
        '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.marker([ultimoSismo.latitud, ultimoSismo.longitud], { icon: pulseIcon })
        .addTo(markersRef.current);
    }
  }, [isClient, L, sismos, sismoSeleccionado, onSelectSismo]);

  // Centrar en sismo seleccionado
  useEffect(() => {
    if (!mapRef.current || !sismoSeleccionado) return;

    mapRef.current.setView([sismoSeleccionado.latitud, sismoSeleccionado.longitud], 8, {
      animate: true,
    });
  }, [sismoSeleccionado]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-siasic-bg-secondary">
        <div className="w-10 h-10 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
}