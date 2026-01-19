// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Sismos en Tiempo Real (API USGS)
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, lazy, Suspense, useCallback } from "react";
import {
  Radio,
  RefreshCw,
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  Wifi,
  WifiOff,
  Filter,
  Globe,
  Crosshair,
  ExternalLink,
} from "lucide-react";

// Mapa en tiempo real
const RealtimeMap = lazy(() => import("@/components/maps/RealtimeMap"));

interface USGSFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    type: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number];
  };
}

interface USGSResponse {
  type: string;
  metadata: {
    generated: number;
    url: string;
    title: string;
    count: number;
  };
  features: USGSFeature[];
}

interface SismoRealTime {
  id: string;
  magnitud: number;
  lugar: string;
  fecha: Date;
  latitud: number;
  longitud: number;
  profundidad: number;
  url: string;
  tsunami: boolean;
  significancia: number;
  distanciaColombia: number;
}

type FiltroTiempo = "hour" | "day" | "week" | "month";
type FiltroMagnitud = "all" | "1.0" | "2.5" | "4.5" | "significant";
type FiltroRegion = "world" | "colombia" | "suramerica";

export default function TiempoRealPage() {
  const [sismos, setSismos] = useState<SismoRealTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState<FiltroTiempo>("day");
  const [filtroMagnitud, setFiltroMagnitud] = useState<FiltroMagnitud>("all");
  const [filtroRegion, setFiltroRegion] = useState<FiltroRegion>("colombia");
  const [sismoSeleccionado, setSismoSeleccionado] = useState<SismoRealTime | null>(null);

  const COLOMBIA_BOUNDS = {
    latMin: -4.5,
    latMax: 13.5,
    lonMin: -82,
    lonMax: -66,
  };

  const SURAMERICA_BOUNDS = {
    latMin: -56,
    latMax: 13,
    lonMin: -82,
    lonMax: -34,
  };

  const COLOMBIA_CENTER = { lat: 4.5709, lon: -74.2973 };

  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/";

      if (filtroMagnitud === "significant") {
        url += "significant_" + filtroTiempo + ".geojson";
      } else if (filtroMagnitud === "4.5") {
        url += "4.5_" + filtroTiempo + ".geojson";
      } else if (filtroMagnitud === "2.5") {
        url += "2.5_" + filtroTiempo + ".geojson";
      } else if (filtroMagnitud === "1.0") {
        url += "1.0_" + filtroTiempo + ".geojson";
      } else {
        url += "all_" + filtroTiempo + ".geojson";
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al conectar con USGS");

      const data: USGSResponse = await response.json();

      let sismosProcessed: SismoRealTime[] = data.features.map((f) => ({
        id: f.id,
        magnitud: f.properties.mag || 0,
        lugar: f.properties.place || "Ubicacion desconocida",
        fecha: new Date(f.properties.time),
        latitud: f.geometry.coordinates[1],
        longitud: f.geometry.coordinates[0],
        profundidad: f.geometry.coordinates[2],
        url: f.properties.url,
        tsunami: f.properties.tsunami === 1,
        significancia: f.properties.sig,
        distanciaColombia: calcularDistancia(
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
          COLOMBIA_CENTER.lat,
          COLOMBIA_CENTER.lon
        ),
      }));

      if (filtroRegion === "colombia") {
        sismosProcessed = sismosProcessed.filter(
          (s) =>
            s.latitud >= COLOMBIA_BOUNDS.latMin &&
            s.latitud <= COLOMBIA_BOUNDS.latMax &&
            s.longitud >= COLOMBIA_BOUNDS.lonMin &&
            s.longitud <= COLOMBIA_BOUNDS.lonMax
        );
      } else if (filtroRegion === "suramerica") {
        sismosProcessed = sismosProcessed.filter(
          (s) =>
            s.latitud >= SURAMERICA_BOUNDS.latMin &&
            s.latitud <= SURAMERICA_BOUNDS.latMax &&
            s.longitud >= SURAMERICA_BOUNDS.lonMin &&
            s.longitud <= SURAMERICA_BOUNDS.lonMax
        );
      }

      sismosProcessed.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      setSismos(sismosProcessed);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error("Error:", err);
      setError("Error al cargar datos de USGS. Verifica tu conexion a internet.");
    } finally {
      setLoading(false);
    }
  }, [filtroTiempo, filtroMagnitud, filtroRegion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      cargarDatos();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, cargarDatos]);

  const tiempoRelativo = (fecha: Date): string => {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return "Hace segundos";
    if (minutos < 60) return "Hace " + minutos + " min";
    if (horas < 24) return "Hace " + horas + " h";
    return "Hace " + dias + " dias";
  };

  const getColorMagnitud = (mag: number): string => {
    if (mag >= 6) return "text-red-500";
    if (mag >= 5) return "text-orange-500";
    if (mag >= 4) return "text-yellow-500";
    if (mag >= 3) return "text-lime-500";
    return "text-green-500";
  };

  const getBgColorMagnitud = (mag: number): string => {
    if (mag >= 6) return "bg-red-500/20 border-red-500/30";
    if (mag >= 5) return "bg-orange-500/20 border-orange-500/30";
    if (mag >= 4) return "bg-yellow-500/20 border-yellow-500/30";
    if (mag >= 3) return "bg-lime-500/20 border-lime-500/30";
    return "bg-green-500/20 border-green-500/30";
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 bg-siasic-superficial/10 rounded-lg border border-siasic-superficial/20">
                  <Radio className="text-siasic-superficial" size={24} />
                </div>
                {autoRefresh && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-siasic-success rounded-full animate-pulse"></span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-siasic-text-primary">
                  Sismos en Tiempo Real
                </h1>
                <p className="text-siasic-text-secondary text-sm">
                  Datos de USGS Earthquake Hazards Program
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {ultimaActualizacion && (
                <span className="text-siasic-text-muted text-sm flex items-center gap-1">
                  <Clock size={14} />
                  {ultimaActualizacion.toLocaleTimeString("es-CO")}
                </span>
              )}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  autoRefresh
                    ? "bg-siasic-success/20 text-siasic-success border border-siasic-success/30"
                    : "bg-siasic-bg-secondary text-siasic-text-muted"
                }`}
              >
                {autoRefresh ? <Wifi size={16} /> : <WifiOff size={16} />}
                {autoRefresh ? "Auto" : "Manual"}
              </button>
              <button
                onClick={cargarDatos}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-siasic-accent-cyan text-siasic-bg-primary rounded-lg font-medium hover:bg-siasic-accent-cyan/90 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-siasic-text-muted" />
            <span className="text-siasic-text-secondary font-medium">Filtros</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Region */}
            <div>
              <label className="text-siasic-text-muted text-xs mb-2 block">Region</label>
              <div className="flex gap-1 bg-siasic-bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setFiltroRegion("colombia")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroRegion === "colombia"
                      ? "bg-siasic-nido text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  <Crosshair size={14} />
                  Colombia
                </button>
                <button
                  onClick={() => setFiltroRegion("suramerica")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroRegion === "suramerica"
                      ? "bg-siasic-nido text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  <MapPin size={14} />
                  Suramerica
                </button>
                <button
                  onClick={() => setFiltroRegion("world")}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroRegion === "world"
                      ? "bg-siasic-nido text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  <Globe size={14} />
                  Mundo
                </button>
              </div>
            </div>

            {/* Tiempo */}
            <div>
              <label className="text-siasic-text-muted text-xs mb-2 block">Periodo</label>
              <div className="flex gap-1 bg-siasic-bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setFiltroTiempo("hour")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroTiempo === "hour"
                      ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  1h
                </button>
                <button
                  onClick={() => setFiltroTiempo("day")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroTiempo === "day"
                      ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setFiltroTiempo("week")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroTiempo === "week"
                      ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setFiltroTiempo("month")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroTiempo === "month"
                      ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  30d
                </button>
              </div>
            </div>

            {/* Magnitud minima */}
            <div>
              <label className="text-siasic-text-muted text-xs mb-2 block">Magnitud minima</label>
              <div className="flex gap-1 bg-siasic-bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setFiltroMagnitud("all")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroMagnitud === "all"
                      ? "bg-siasic-intermedio text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroMagnitud("2.5")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroMagnitud === "2.5"
                      ? "bg-siasic-intermedio text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  M2.5+
                </button>
                <button
                  onClick={() => setFiltroMagnitud("4.5")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroMagnitud === "4.5"
                      ? "bg-siasic-intermedio text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  M4.5+
                </button>
                <button
                  onClick={() => setFiltroMagnitud("significant")}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    filtroMagnitud === "significant"
                      ? "bg-siasic-superficial text-white"
                      : "text-siasic-text-secondary hover:text-siasic-text-primary"
                  }`}
                >
                  Signif.
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapidos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4">
            <p className="text-siasic-text-muted text-sm">Total Sismos</p>
            <p className="text-2xl font-bold text-siasic-accent-cyan">{sismos.length}</p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4">
            <p className="text-siasic-text-muted text-sm">Mag. Maxima</p>
            <p className="text-2xl font-bold text-siasic-superficial">
              {sismos.length > 0 ? "M" + Math.max(...sismos.map((s) => s.magnitud)).toFixed(1) : "-"}
            </p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4">
            <p className="text-siasic-text-muted text-sm">M4.0+</p>
            <p className="text-2xl font-bold text-siasic-intermedio">
              {sismos.filter((s) => s.magnitud >= 4).length}
            </p>
          </div>
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4">
            <p className="text-siasic-text-muted text-sm">Con Alerta Tsunami</p>
            <p className="text-2xl font-bold text-siasic-profundo">
              {sismos.filter((s) => s.tsunami).length}
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-2 bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
            <div className="p-4 border-b border-siasic-bg-secondary flex items-center justify-between">
              <h3 className="text-lg font-semibold text-siasic-text-primary flex items-center gap-2">
                <MapPin size={20} className="text-siasic-accent-cyan" />
                Mapa de Actividad
              </h3>
              <span className="text-siasic-text-muted text-sm">
                {sismos.length} eventos
              </span>
            </div>
            <div className="h-[500px]">
              {error ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="text-siasic-danger mx-auto mb-3" size={40} />
                    <p className="text-siasic-text-secondary">{error}</p>
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-siasic-bg-secondary">
                      <div className="w-10 h-10 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <RealtimeMap
                    sismos={sismos}
                    sismoSeleccionado={sismoSeleccionado}
                    onSelectSismo={setSismoSeleccionado}
                    region={filtroRegion}
                  />
                </Suspense>
              )}
            </div>
          </div>

          {/* Lista de sismos */}
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
            <div className="p-4 border-b border-siasic-bg-secondary">
              <h3 className="text-lg font-semibold text-siasic-text-primary flex items-center gap-2">
                <Activity size={20} className="text-siasic-intermedio" />
                Ultimos Sismos
              </h3>
            </div>
            <div className="h-[500px] overflow-y-auto">
              {loading && sismos.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-siasic-text-muted">Cargando datos...</p>
                </div>
              ) : sismos.length === 0 ? (
                <div className="p-8 text-center">
                  <Globe className="text-siasic-text-muted mx-auto mb-3" size={40} />
                  <p className="text-siasic-text-muted">
                    No hay sismos registrados en esta region
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-siasic-bg-secondary">
                  {sismos.slice(0, 50).map((sismo) => (
                    <button
                      key={sismo.id}
                      onClick={() => setSismoSeleccionado(sismo)}
                      className={`w-full p-4 text-left hover:bg-siasic-bg-secondary/50 transition-all ${
                        sismoSeleccionado?.id === sismo.id ? "bg-siasic-bg-secondary" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getBgColorMagnitud(
                            sismo.magnitud
                          )}`}
                        >
                          <span className={`font-bold ${getColorMagnitud(sismo.magnitud)}`}>
                            {sismo.magnitud.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-siasic-text-primary text-sm font-medium truncate">
                            {sismo.lugar}
                          </p>
                          <p className="text-siasic-text-muted text-xs mt-1">
                            {sismo.profundidad.toFixed(1)} km de profundidad
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-siasic-text-muted text-xs">
                              {tiempoRelativo(sismo.fecha)}
                            </span>
                            {sismo.tsunami && (
                              <span className="text-xs bg-siasic-danger/20 text-siasic-danger px-2 py-0.5 rounded">
                                Tsunami
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalle del sismo seleccionado */}
        {sismoSeleccionado && (
          <div className="mt-6 bg-siasic-bg-card border border-siasic-accent-cyan/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-siasic-text-primary">
                Detalle del Sismo
              </h3>
              <button
                onClick={() => setSismoSeleccionado(null)}
                className="text-siasic-text-muted hover:text-siasic-text-primary text-xl"
              >
                x
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-siasic-text-muted text-sm">Magnitud</p>
                <p className={`text-2xl font-bold ${getColorMagnitud(sismoSeleccionado.magnitud)}`}>
                  M{sismoSeleccionado.magnitud.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Profundidad</p>
                <p className="text-siasic-text-primary font-medium">
                  {sismoSeleccionado.profundidad.toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Fecha y Hora</p>
                <p className="text-siasic-text-primary font-medium">
                  {sismoSeleccionado.fecha.toLocaleString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Coordenadas</p>
                <p className="text-siasic-text-primary font-medium text-sm">
                  {sismoSeleccionado.latitud.toFixed(3)}, {sismoSeleccionado.longitud.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Ubicacion</p>
                <p className="text-siasic-text-primary font-medium text-sm">
                  {sismoSeleccionado.lugar}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-siasic-bg-secondary">
              <a
                href={sismoSeleccionado.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-siasic-accent-cyan hover:underline text-sm inline-flex items-center gap-2"
              >
                Ver mas detalles en USGS
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Fuente */}
        <div className="mt-6 text-center text-siasic-text-muted text-sm">
          Datos proporcionados por{" "}
          <a
            href="https://earthquake.usgs.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-siasic-accent-cyan hover:underline"
          >
            USGS Earthquake Hazards Program
          </a>
        </div>
      </div>
    </div>
  );
}
