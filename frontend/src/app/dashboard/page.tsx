// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Dashboard Principal con Mapa y Gráficos
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { 
  Activity, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  Layers,
  BarChart3,
  PieChart,
  Clock,
  Mountain,
  Map
} from "lucide-react";
import { sismosApi } from "@/lib/api";
import { 
  EstadisticasGenerales, 
  DistribucionMensual, 
  DistribucionProfundidad,
  Sismo
} from "@/types";
import { formatDateTime } from "@/lib/utils";

// Importar componentes de gráficos
import { MagnitudChart, ProfundidadChart, TimelineChart } from "@/components/charts";

// Importar mapa dinámicamente
const DashboardMap = lazy(() => import("@/components/maps/DashboardMap"));

export default function DashboardPage() {
  const [stats, setStats] = useState<EstadisticasGenerales | null>(null);
  const [mensual, setMensual] = useState<DistribucionMensual[]>([]);
  const [profundidad, setProfundidad] = useState<DistribucionProfundidad[]>([]);
  const [sismos, setSismos] = useState<Sismo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"graficos" | "mapa">("graficos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, mensualData, profundidadData, sismosData] = await Promise.all([
          sismosApi.getEstadisticas(),
          sismosApi.getDistribucionMensual(),
          sismosApi.getDistribucionProfundidad(),
          sismosApi.getParaMapa(),
        ]);
        setStats(statsData);
        setMensual(mensualData);
        setProfundidad(profundidadData);
        setSismos(sismosData);
      } catch (err) {
        setError("Error al cargar los datos. Verifica que el backend esté corriendo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-siasic-text-secondary">Cargando datos sísmicos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="text-siasic-danger mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-siasic-text-primary mb-2">Error de Conexión</h2>
          <p className="text-siasic-text-secondary mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-siasic-text-primary mb-2">
            Dashboard Sísmico
          </h1>
          <p className="text-siasic-text-secondary">
            Monitoreo y análisis de la actividad sísmica en Santander - {sismos.length.toLocaleString()} eventos registrados
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Sismos */}
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5 hover:border-siasic-accent-cyan/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Total Sismos</p>
                <p className="text-3xl font-bold text-siasic-accent-cyan mt-1">
                  {stats?.total_sismos?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 bg-siasic-accent-cyan/10 rounded-lg">
                <Activity className="text-siasic-accent-cyan" size={20} />
              </div>
            </div>
          </div>

          {/* Magnitud Promedio */}
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5 hover:border-siasic-intermedio/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Mag. Promedio</p>
                <p className="text-3xl font-bold text-siasic-intermedio mt-1">
                  {stats?.magnitud_promedio?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="p-2 bg-siasic-intermedio/10 rounded-lg">
                <TrendingUp className="text-siasic-intermedio" size={20} />
              </div>
            </div>
          </div>

          {/* Sismos Nido */}
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5 hover:border-siasic-nido/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Nido Sísmico</p>
                <p className="text-3xl font-bold text-siasic-nido mt-1">
                  {stats?.sismos_nido?.toLocaleString() || 0}
                </p>
                <p className="text-siasic-text-muted text-xs mt-1">
                  {stats && stats.total_sismos > 0 ? Math.round((stats.sismos_nido / stats.total_sismos) * 100) : 0}% del total
                </p>
              </div>
              <div className="p-2 bg-siasic-nido/10 rounded-lg">
                <MapPin className="text-siasic-nido" size={20} />
              </div>
            </div>
          </div>

          {/* Magnitud Máxima */}
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5 hover:border-siasic-superficial/30 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Mag. Máxima</p>
                <p className="text-3xl font-bold text-siasic-superficial mt-1">
                  M{stats?.magnitud_maxima?.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="p-2 bg-siasic-superficial/10 rounded-lg">
                <AlertTriangle className="text-siasic-superficial" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Secundarios */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-siasic-profundo/10 rounded-lg">
              <Mountain className="text-siasic-profundo" size={20} />
            </div>
            <div>
              <p className="text-siasic-text-muted text-sm">Prof. Promedio</p>
              <p className="text-xl font-bold text-siasic-text-primary">
                {stats?.profundidad_promedio?.toFixed(1) || "0"} km
              </p>
            </div>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-siasic-accent-blue/10 rounded-lg">
              <Layers className="text-siasic-accent-blue" size={20} />
            </div>
            <div>
              <p className="text-siasic-text-muted text-sm">En Santander</p>
              <p className="text-xl font-bold text-siasic-text-primary">
                {stats?.sismos_santander?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-siasic-success/10 rounded-lg">
              <Clock className="text-siasic-success" size={20} />
            </div>
            <div>
              <p className="text-siasic-text-muted text-sm">Último Sismo</p>
              <p className="text-lg font-bold text-siasic-text-primary">
                M{stats?.ultimo_sismo?.magnitud?.toFixed(1) || "0.0"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs: Gráficos / Mapa */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("graficos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "graficos"
                ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                : "bg-siasic-bg-card text-siasic-text-secondary hover:text-siasic-text-primary border border-siasic-bg-secondary"
            }`}
          >
            <BarChart3 size={18} />
            Gráficos
          </button>
          <button
            onClick={() => setActiveTab("mapa")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === "mapa"
                ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                : "bg-siasic-bg-card text-siasic-text-secondary hover:text-siasic-text-primary border border-siasic-bg-secondary"
            }`}
          >
            <Map size={18} />
            Mapa Interactivo
          </button>
        </div>

        {activeTab === "mapa" ? (
          /* MAPA INTERACTIVO */
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
            <div className="p-4 border-b border-siasic-bg-secondary">
              <h3 className="text-lg font-semibold text-siasic-text-primary flex items-center gap-2">
                <Map size={20} className="text-siasic-accent-cyan" />
                Mapa de Actividad Sísmica
              </h3>
              <p className="text-siasic-text-muted text-sm mt-1">
                {sismos.length.toLocaleString()} sismos registrados en 2024
              </p>
            </div>
            <div className="h-[500px]">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-siasic-bg-secondary">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-siasic-text-muted text-sm">Cargando mapa...</p>
                  </div>
                </div>
              }>
                <DashboardMap sismos={sismos} height="500px" />
              </Suspense>
            </div>
          </div>
        ) : (
          /* GRÁFICOS */
          <>
            {/* Fila de gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Distribución Mensual */}
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="text-siasic-accent-cyan" size={20} />
                  <h3 className="text-lg font-semibold text-siasic-text-primary">
                    Actividad Mensual
                  </h3>
                </div>
                {mensual.length > 0 ? (
                  <MagnitudChart data={mensual} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-siasic-text-muted">
                    Sin datos disponibles
                  </div>
                )}
              </div>

              {/* Distribución por Profundidad */}
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="text-siasic-nido" size={20} />
                  <h3 className="text-lg font-semibold text-siasic-text-primary">
                    Distribución por Profundidad
                  </h3>
                </div>
                {profundidad.length > 0 ? (
                  <ProfundidadChart data={profundidad} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-siasic-text-muted">
                    Sin datos disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Timeline de sismos */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-siasic-intermedio" size={20} />
                <h3 className="text-lg font-semibold text-siasic-text-primary">
                  Timeline de Sismos por Magnitud
                </h3>
                <span className="text-siasic-text-muted text-sm ml-auto">
                  Últimos 100 eventos
                </span>
              </div>
              {sismos.length > 0 ? (
                <TimelineChart data={sismos} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-siasic-text-muted">
                  Sin datos disponibles
                </div>
              )}
            </div>
          </>
        )}

        {/* Último sismo detallado */}
        {stats?.ultimo_sismo && (
          <div className="bg-siasic-bg-card border border-siasic-accent-cyan/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
              <Activity className="text-siasic-accent-cyan" size={20} />
              Último Evento Sísmico Registrado
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-siasic-text-muted text-sm">Fecha y Hora</p>
                <p className="text-siasic-text-primary font-medium">
                  {formatDateTime(stats.ultimo_sismo.fecha_hora)}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Magnitud</p>
                <p className="text-siasic-accent-cyan font-bold text-xl">
                  M{stats.ultimo_sismo.magnitud?.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Profundidad</p>
                <p className="text-siasic-text-primary font-medium">
                  {stats.ultimo_sismo.profundidad?.toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Ubicación</p>
                <p className="text-siasic-text-primary font-medium">
                  {stats.ultimo_sismo.municipio || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Tipo</p>
                <span 
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                    ${stats.ultimo_sismo.tipo_profundidad === "Nido Sísmico" 
                      ? "bg-siasic-nido/20 text-siasic-nido border border-siasic-nido/30" 
                      : stats.ultimo_sismo.tipo_profundidad === "Superficial"
                      ? "bg-siasic-superficial/20 text-siasic-superficial border border-siasic-superficial/30"
                      : stats.ultimo_sismo.tipo_profundidad === "Intermedio"
                      ? "bg-siasic-intermedio/20 text-siasic-intermedio border border-siasic-intermedio/30"
                      : "bg-siasic-profundo/20 text-siasic-profundo border border-siasic-profundo/30"
                    }`}
                >
                  {stats.ultimo_sismo.tipo_profundidad}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}