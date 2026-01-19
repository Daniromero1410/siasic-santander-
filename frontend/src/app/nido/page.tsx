// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Página de Análisis del Nido Sísmico
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import {
  Activity,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Info,
  BarChart3,
  Layers,
  Target,
  Zap,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { sismosApi } from "@/lib/api";
import { Sismo } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Mapa del Nido
const NidoMap = lazy(() => import("@/components/maps/NidoMap"));

interface NidoStats {
  total: number;
  porcentaje: number;
  magnitudPromedio: number;
  magnitudMaxima: number;
  profundidadPromedio: number;
  profundidadMin: number;
  profundidadMax: number;
  sismosPorMes: { mes: string; cantidad: number; nido: number }[];
  distribucionMagnitud: { rango: string; cantidad: number; color: string }[];
  distribucionProfundidad: { profundidad: number; cantidad: number }[];
  comparativa: {
    nido: { total: number; magProm: number; profProm: number };
    otros: { total: number; magProm: number; profProm: number };
  };
  ultimoSismoNido: Sismo | null;
  tendencia: "aumentando" | "disminuyendo" | "estable";
}

export default function NidoPage() {
  const [sismos, setSismos] = useState<Sismo[]>([]);
  const [sismosNido, setSismosNido] = useState<Sismo[]>([]);
  const [stats, setStats] = useState<NidoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "mapa" | "comparativa">("stats");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await sismosApi.getTodos();
        setSismos(data);

        // Filtrar sismos del Nido (profundidad 140-180 km)
        const nido = data.filter(
          (s) => s.profundidad >= 140 && s.profundidad <= 180
        );
        setSismosNido(nido);

        // Calcular estadísticas
        const calculatedStats = calcularEstadisticas(data, nido);
        setStats(calculatedStats);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calcularEstadisticas = (todos: Sismo[], nido: Sismo[]): NidoStats => {
    const otros = todos.filter((s) => s.profundidad < 140 || s.profundidad > 180);

    // Distribución por mes
    const mesesMap = new Map<string, { total: number; nido: number }>();
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    todos.forEach((s) => {
      const fecha = new Date(s.fecha_hora);
      const mes = meses[fecha.getMonth()];
      const current = mesesMap.get(mes) || { total: 0, nido: 0 };
      current.total++;
      if (s.profundidad >= 140 && s.profundidad <= 180) {
        current.nido++;
      }
      mesesMap.set(mes, current);
    });

    const sismosPorMes = meses.map((mes) => ({
      mes,
      cantidad: mesesMap.get(mes)?.total || 0,
      nido: mesesMap.get(mes)?.nido || 0,
    }));

    // Distribución por magnitud
    const rangos = [
      { min: 0, max: 2, label: "< 2.0", color: "#22C55E" },
      { min: 2, max: 3, label: "2.0-3.0", color: "#84CC16" },
      { min: 3, max: 4, label: "3.0-4.0", color: "#FBBF24" },
      { min: 4, max: 5, label: "4.0-5.0", color: "#F97316" },
      { min: 5, max: 10, label: "> 5.0", color: "#DC2626" },
    ];

    const distribucionMagnitud = rangos.map((r) => ({
      rango: r.label,
      cantidad: nido.filter((s) => s.magnitud >= r.min && s.magnitud < r.max).length,
      color: r.color,
    }));

    // Distribución por profundidad (histograma)
    const profBins = [];
    for (let p = 140; p <= 180; p += 5) {
      profBins.push({
        profundidad: p,
        cantidad: nido.filter((s) => s.profundidad >= p && s.profundidad < p + 5).length,
      });
    }

    // Último sismo del nido
    const nidoOrdenado = [...nido].sort(
      (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
    );

    // Tendencia (comparar últimos 3 meses vs 3 meses anteriores)
    const ahora = new Date();
    const hace3Meses = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
    const hace6Meses = new Date(ahora.getTime() - 180 * 24 * 60 * 60 * 1000);

    const ultimos3 = nido.filter((s) => new Date(s.fecha_hora) >= hace3Meses).length;
    const anteriores3 = nido.filter(
      (s) => new Date(s.fecha_hora) >= hace6Meses && new Date(s.fecha_hora) < hace3Meses
    ).length;

    let tendencia: "aumentando" | "disminuyendo" | "estable" = "estable";
    if (ultimos3 > anteriores3 * 1.2) tendencia = "aumentando";
    else if (ultimos3 < anteriores3 * 0.8) tendencia = "disminuyendo";

    return {
      total: nido.length,
      porcentaje: todos.length > 0 ? (nido.length / todos.length) * 100 : 0,
      magnitudPromedio: nido.length > 0 ? nido.reduce((sum, s) => sum + s.magnitud, 0) / nido.length : 0,
      magnitudMaxima: nido.length > 0 ? Math.max(...nido.map((s) => s.magnitud)) : 0,
      profundidadPromedio: nido.length > 0 ? nido.reduce((sum, s) => sum + s.profundidad, 0) / nido.length : 0,
      profundidadMin: nido.length > 0 ? Math.min(...nido.map((s) => s.profundidad)) : 0,
      profundidadMax: nido.length > 0 ? Math.max(...nido.map((s) => s.profundidad)) : 0,
      sismosPorMes,
      distribucionMagnitud,
      distribucionProfundidad: profBins,
      comparativa: {
        nido: {
          total: nido.length,
          magProm: nido.length > 0 ? nido.reduce((sum, s) => sum + s.magnitud, 0) / nido.length : 0,
          profProm: nido.length > 0 ? nido.reduce((sum, s) => sum + s.profundidad, 0) / nido.length : 0,
        },
        otros: {
          total: otros.length,
          magProm: otros.length > 0 ? otros.reduce((sum, s) => sum + s.magnitud, 0) / otros.length : 0,
          profProm: otros.length > 0 ? otros.reduce((sum, s) => sum + s.profundidad, 0) / otros.length : 0,
        },
      },
      ultimoSismoNido: nidoOrdenado[0] || null,
      tendencia,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-siasic-nido/30 border-t-siasic-nido rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-siasic-text-secondary">Analizando el Nido Sísmico...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-siasic-danger mx-auto mb-4" size={48} />
          <p className="text-siasic-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-siasic-nido/10 rounded-lg border border-siasic-nido/20">
              <Target className="text-siasic-nido" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-siasic-text-primary">
                Nido Sísmico de Bucaramanga
              </h1>
              <p className="text-siasic-text-secondary">
                Análisis detallado del fenómeno sísmico más activo de Colombia
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-siasic-nido/20 to-siasic-bg-card border border-siasic-nido/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Info className="text-siasic-nido mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-2">
                ¿Qué es el Nido Sísmico?
              </h3>
              <p className="text-siasic-text-secondary text-sm leading-relaxed">
                El Nido Sísmico de Bucaramanga es una zona de alta concentración de actividad sísmica 
                ubicada entre <span className="text-siasic-nido font-semibold">140 y 180 km de profundidad</span>. 
                Es uno de los fenómenos sísmicos más estudiados del mundo debido a su inusual actividad 
                a grandes profundidades, generando más del {stats.porcentaje.toFixed(0)}% de los sismos 
                registrados en la región.
              </p>
            </div>
          </div>
        </div>

        {/* KPIs del Nido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-siasic-bg-card border border-siasic-nido/30 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Sismos del Nido</p>
                <p className="text-3xl font-bold text-siasic-nido mt-1">
                  {stats.total.toLocaleString()}
                </p>
                <p className="text-siasic-nido/70 text-sm mt-1">
                  {stats.porcentaje.toFixed(1)}% del total
                </p>
              </div>
              <div className="p-2 bg-siasic-nido/10 rounded-lg">
                <Activity className="text-siasic-nido" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Mag. Promedio</p>
                <p className="text-3xl font-bold text-siasic-intermedio mt-1">
                  {stats.magnitudPromedio.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-siasic-intermedio/10 rounded-lg">
                <TrendingUp className="text-siasic-intermedio" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Mag. Máxima</p>
                <p className="text-3xl font-bold text-siasic-superficial mt-1">
                  M{stats.magnitudMaxima.toFixed(1)}
                </p>
              </div>
              <div className="p-2 bg-siasic-superficial/10 rounded-lg">
                <Zap className="text-siasic-superficial" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-siasic-text-muted text-sm">Prof. Promedio</p>
                <p className="text-3xl font-bold text-siasic-profundo mt-1">
                  {stats.profundidadPromedio.toFixed(0)} km
                </p>
                <p className="text-siasic-text-muted text-xs mt-1">
                  {stats.profundidadMin.toFixed(0)} - {stats.profundidadMax.toFixed(0)} km
                </p>
              </div>
              <div className="p-2 bg-siasic-profundo/10 rounded-lg">
                <Layers className="text-siasic-profundo" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Tendencia */}
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-siasic-text-muted" size={20} />
              <span className="text-siasic-text-secondary">Tendencia últimos 3 meses:</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              stats.tendencia === "aumentando" 
                ? "bg-siasic-superficial/20 text-siasic-superficial"
                : stats.tendencia === "disminuyendo"
                ? "bg-siasic-success/20 text-siasic-success"
                : "bg-siasic-intermedio/20 text-siasic-intermedio"
            }`}>
              {stats.tendencia === "aumentando" ? (
                <ArrowUpRight size={16} />
              ) : stats.tendencia === "disminuyendo" ? (
                <ArrowDownRight size={16} />
              ) : null}
              <span className="font-medium capitalize">{stats.tendencia}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "stats"
                ? "bg-siasic-nido text-white"
                : "bg-siasic-bg-card text-siasic-text-secondary hover:text-siasic-text-primary border border-siasic-bg-secondary"
            }`}
          >
            <BarChart3 size={18} />
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab("mapa")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "mapa"
                ? "bg-siasic-nido text-white"
                : "bg-siasic-bg-card text-siasic-text-secondary hover:text-siasic-text-primary border border-siasic-bg-secondary"
            }`}
          >
            <MapPin size={18} />
            Mapa del Nido
          </button>
          <button
            onClick={() => setActiveTab("comparativa")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "comparativa"
                ? "bg-siasic-nido text-white"
                : "bg-siasic-bg-card text-siasic-text-secondary hover:text-siasic-text-primary border border-siasic-bg-secondary"
            }`}
          >
            <Activity size={18} />
            Comparativa
          </button>
        </div>

        {/* Contenido de tabs */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Gráfico de actividad mensual */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-siasic-nido" />
                Actividad Mensual: Nido vs Total
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.sismosPorMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                  <XAxis dataKey="mes" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f2744",
                      border: "1px solid #1a2d4a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="cantidad" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nido" name="Nido Sísmico" fill="#6B46C1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Distribución por magnitud */}
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-4">
                  Distribución por Magnitud
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.distribucionMagnitud} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                    <XAxis type="number" stroke="#64748B" fontSize={12} />
                    <YAxis dataKey="rango" type="category" stroke="#64748B" fontSize={12} width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f2744",
                        border: "1px solid #1a2d4a",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                      {stats.distribucionMagnitud.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribución por profundidad */}
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-siasic-text-primary mb-4">
                  Distribución por Profundidad (km)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats.distribucionProfundidad} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNido" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6B46C1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
                    <XAxis dataKey="profundidad" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f2744",
                        border: "1px solid #1a2d4a",
                        borderRadius: "8px",
                      }}
                      labelFormatter={(value) => `${value} km`}
                    />
                    <Area
                      type="monotone"
                      dataKey="cantidad"
                      stroke="#6B46C1"
                      fillOpacity={1}
                      fill="url(#colorNido)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "mapa" && (
          <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
            <div className="p-4 border-b border-siasic-bg-secondary">
              <h3 className="text-lg font-semibold text-siasic-text-primary">
                Ubicación de Sismos del Nido
              </h3>
              <p className="text-siasic-text-muted text-sm">
                {sismosNido.length.toLocaleString()} sismos entre 140-180 km de profundidad
              </p>
            </div>
            <div className="h-[500px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-siasic-bg-secondary">
                    <div className="w-10 h-10 border-4 border-siasic-nido/30 border-t-siasic-nido rounded-full animate-spin"></div>
                  </div>
                }
              >
                <NidoMap sismos={sismosNido} />
              </Suspense>
            </div>
          </div>
        )}

        {activeTab === "comparativa" && (
          <div className="space-y-6">
            {/* Tabla comparativa */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-6">
                Nido Sísmico vs Otros Sismos
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nido */}
                <div className="bg-siasic-nido/10 border border-siasic-nido/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-siasic-nido rounded-full"></div>
                    <h4 className="text-lg font-semibold text-siasic-nido">Nido Sísmico</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Total sismos</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.nido.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Magnitud promedio</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.nido.magProm.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Profundidad promedio</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.nido.profProm.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Rango de profundidad</span>
                      <span className="text-siasic-text-primary font-bold">140-180 km</span>
                    </div>
                  </div>
                </div>

                {/* Otros */}
                <div className="bg-siasic-bg-secondary/50 border border-siasic-bg-secondary rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-siasic-accent-blue rounded-full"></div>
                    <h4 className="text-lg font-semibold text-siasic-accent-blue">Otros Sismos</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Total sismos</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.otros.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Magnitud promedio</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.otros.magProm.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Profundidad promedio</span>
                      <span className="text-siasic-text-primary font-bold">
                        {stats.comparativa.otros.profProm.toFixed(1)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-siasic-text-muted">Rango de profundidad</span>
                      <span className="text-siasic-text-primary font-bold">0-140 / 180+ km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualización de proporciones */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-4">
                Proporción de Actividad Sísmica
              </h3>
              <div className="relative h-12 bg-siasic-bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-siasic-nido flex items-center justify-center transition-all"
                  style={{ width: `${stats.porcentaje}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    Nido: {stats.porcentaje.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="absolute right-0 top-0 h-full bg-siasic-accent-blue flex items-center justify-center"
                  style={{ width: `${100 - stats.porcentaje}%` }}
                >
                  <span className="text-white text-sm font-bold">
                    Otros: {(100 - stats.porcentaje).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Último sismo del nido */}
        {stats.ultimoSismoNido && (
          <div className="mt-8 bg-siasic-bg-card border border-siasic-nido/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
              <Activity className="text-siasic-nido" size={20} />
              Último Sismo del Nido Sísmico
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-siasic-text-muted text-sm">Fecha</p>
                <p className="text-siasic-text-primary font-medium">
                  {new Date(stats.ultimoSismoNido.fecha_hora).toLocaleDateString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Hora</p>
                <p className="text-siasic-text-primary font-medium">
                  {new Date(stats.ultimoSismoNido.fecha_hora).toLocaleTimeString("es-CO")}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Magnitud</p>
                <p className="text-siasic-nido font-bold text-xl">
                  M{stats.ultimoSismoNido.magnitud.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Profundidad</p>
                <p className="text-siasic-text-primary font-medium">
                  {stats.ultimoSismoNido.profundidad.toFixed(1)} km
                </p>
              </div>
              <div>
                <p className="text-siasic-text-muted text-sm">Ubicación</p>
                <p className="text-siasic-text-primary font-medium">
                  {stats.ultimoSismoNido.municipio || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}