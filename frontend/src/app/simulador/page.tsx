// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Simulador Sísmico con Mapa
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import { useState, lazy, Suspense } from "react";
import { 
  Cpu, 
  Play, 
  MapPin, 
  AlertTriangle,
  Activity,
  Users,
  Clock,
  RotateCcw,
  Info,
  Map
} from "lucide-react";
import { simuladorApi } from "@/lib/api";
import { SimuladorOutput, SimuladorInput } from "@/types";

// Importar el mapa dinámicamente para evitar SSR issues
const SimuladorMap = lazy(() => import("@/components/maps/SimuladorMap"));

// Escenarios predefinidos
const ESCENARIOS = [
  {
    nombre: "Nido Sísmico - Moderado",
    descripcion: "Sismo típico del Nido de Bucaramanga",
    latitud: 6.78,
    longitud: -73.18,
    magnitud: 4.5,
    profundidad: 147
  },
  {
    nombre: "Nido Sísmico - Fuerte",
    descripcion: "Sismo significativo del Nido",
    latitud: 6.78,
    longitud: -73.18,
    magnitud: 5.5,
    profundidad: 150
  },
  {
    nombre: "Superficial - Bucaramanga",
    descripcion: "Sismo superficial cerca de la ciudad",
    latitud: 7.12,
    longitud: -73.12,
    magnitud: 4.0,
    profundidad: 30
  },
  {
    nombre: "Profundo - Regional",
    descripcion: "Sismo profundo de alcance regional",
    latitud: 6.90,
    longitud: -73.05,
    magnitud: 5.0,
    profundidad: 200
  }
];

export default function SimuladorPage() {
  // Estado del formulario
  const [params, setParams] = useState<SimuladorInput>({
    latitud: 6.78,
    longitud: -73.18,
    magnitud: 4.5,
    profundidad: 147
  });
  
  // Estado de resultados
  const [resultado, setResultado] = useState<SimuladorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escenarioActivo, setEscenarioActivo] = useState<string | null>("Nido Sísmico - Moderado");
  const [tabActiva, setTabActiva] = useState<"datos" | "mapa">("datos");

  // Ejecutar simulación
  const ejecutarSimulacion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await simuladorApi.simular(params);
      setResultado(data);
    } catch (err) {
      setError("Error al ejecutar la simulación. Verifica que el backend esté corriendo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar escenario predefinido
  const cargarEscenario = (escenario: typeof ESCENARIOS[0]) => {
    setParams({
      latitud: escenario.latitud,
      longitud: escenario.longitud,
      magnitud: escenario.magnitud,
      profundidad: escenario.profundidad
    });
    setEscenarioActivo(escenario.nombre);
    setResultado(null);
  };

  // Resetear formulario
  const resetear = () => {
    setParams({
      latitud: 6.78,
      longitud: -73.18,
      magnitud: 4.5,
      profundidad: 147
    });
    setResultado(null);
    setError(null);
    setEscenarioActivo("Nido Sísmico - Moderado");
  };

  // Obtener color según intensidad Mercalli
  const getMercalliColor = (mercalli: string) => {
    const escala: Record<string, string> = {
      "I": "#a3e635", "II": "#84cc16", "III": "#22c55e", "IV": "#14b8a6",
      "V": "#facc15", "VI": "#f97316", "VII": "#ef4444", "VIII": "#dc2626",
      "IX": "#b91c1c", "X": "#7f1d1d", "XI": "#581c87", "XII": "#3b0764"
    };
    return escala[mercalli] || "#666";
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-siasic-nido/10 rounded-lg border border-siasic-nido/20">
              <Cpu className="text-siasic-nido" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-siasic-text-primary">
              Simulador Sísmico
            </h1>
          </div>
          <p className="text-siasic-text-secondary">
            Modela escenarios sísmicos y predice réplicas usando el modelo Omori-Utsu
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            {/* Escenarios Predefinidos */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
                <Activity size={18} className="text-siasic-accent-cyan" />
                Escenarios Predefinidos
              </h3>
              <div className="space-y-2">
                {ESCENARIOS.map((escenario) => (
                  <button
                    key={escenario.nombre}
                    onClick={() => cargarEscenario(escenario)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      escenarioActivo === escenario.nombre
                        ? "bg-siasic-nido/10 border-siasic-nido/30 text-siasic-nido"
                        : "bg-siasic-bg-secondary/50 border-siasic-bg-secondary hover:border-siasic-accent-cyan/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{escenario.nombre}</p>
                    <p className="text-xs text-siasic-text-muted mt-1">{escenario.descripcion}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de Parámetros */}
            <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
              <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-siasic-accent-cyan" />
                Parámetros del Sismo
              </h3>
              
              <div className="space-y-4">
                {/* Latitud */}
                <div>
                  <label className="text-siasic-text-secondary text-sm mb-1 block">Latitud (°N)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={params.latitud}
                    onChange={(e) => {
                      setParams({ ...params, latitud: parseFloat(e.target.value) || 0 });
                      setEscenarioActivo(null);
                    }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-4 py-2.5 text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan transition-colors"
                  />
                </div>

                {/* Longitud */}
                <div>
                  <label className="text-siasic-text-secondary text-sm mb-1 block">Longitud (°W)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={params.longitud}
                    onChange={(e) => {
                      setParams({ ...params, longitud: parseFloat(e.target.value) || 0 });
                      setEscenarioActivo(null);
                    }}
                    className="w-full bg-siasic-bg-secondary border border-siasic-bg-secondary rounded-lg px-4 py-2.5 text-siasic-text-primary focus:outline-none focus:border-siasic-accent-cyan transition-colors"
                  />
                </div>

                {/* Magnitud */}
                <div>
                  <label className="text-siasic-text-secondary text-sm mb-1 block">
                    Magnitud: <span className="text-siasic-accent-cyan font-bold">{params.magnitud.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="0.1"
                    value={params.magnitud}
                    onChange={(e) => {
                      setParams({ ...params, magnitud: parseFloat(e.target.value) });
                      setEscenarioActivo(null);
                    }}
                    className="w-full accent-siasic-accent-cyan"
                  />
                  <div className="flex justify-between text-xs text-siasic-text-muted mt-1">
                    <span>2.0</span>
                    <span>8.0</span>
                  </div>
                </div>

                {/* Profundidad */}
                <div>
                  <label className="text-siasic-text-secondary text-sm mb-1 block">
                    Profundidad: <span className="text-siasic-nido font-bold">{params.profundidad} km</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="300"
                    step="1"
                    value={params.profundidad}
                    onChange={(e) => {
                      setParams({ ...params, profundidad: parseInt(e.target.value) });
                      setEscenarioActivo(null);
                    }}
                    className="w-full accent-siasic-nido"
                  />
                  <div className="flex justify-between text-xs text-siasic-text-muted mt-1">
                    <span>1 km</span>
                    <span className="text-siasic-nido">Nido: 140-180</span>
                    <span>300 km</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={ejecutarSimulacion}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-siasic-accent-cyan text-siasic-bg-primary font-semibold py-3 rounded-lg hover:bg-siasic-accent-cyan/90 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-siasic-bg-primary/30 border-t-siasic-bg-primary rounded-full animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}
                  {loading ? "Simulando..." : "Simular"}
                </button>
                <button
                  onClick={resetear}
                  className="p-3 bg-siasic-bg-secondary text-siasic-text-secondary rounded-lg hover:text-siasic-text-primary transition-colors"
                  title="Resetear"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-siasic-danger/10 border border-siasic-danger/30 rounded-lg">
                  <p className="text-siasic-danger text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Resultados */}
          <div className="lg:col-span-2 space-y-6">
            {!resultado ? (
              <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-siasic-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Cpu className="text-siasic-text-muted" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-siasic-text-primary mb-2">
                  Configura los parámetros
                </h3>
                <p className="text-siasic-text-muted max-w-md mx-auto">
                  Selecciona un escenario predefinido o ajusta los parámetros manualmente, 
                  luego presiona "Simular" para ver los resultados.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs: Datos / Mapa */}
                <div className="flex gap-2 bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-1">
                  <button
                    onClick={() => setTabActiva("datos")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                      tabActiva === "datos"
                        ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                        : "text-siasic-text-secondary hover:text-siasic-text-primary"
                    }`}
                  >
                    <Activity size={18} />
                    Resultados
                  </button>
                  <button
                    onClick={() => setTabActiva("mapa")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                      tabActiva === "mapa"
                        ? "bg-siasic-accent-cyan text-siasic-bg-primary"
                        : "text-siasic-text-secondary hover:text-siasic-text-primary"
                    }`}
                  >
                    <Map size={18} />
                    Mapa de Impacto
                  </button>
                </div>

                {tabActiva === "mapa" ? (
                  /* MAPA */
                  <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl overflow-hidden">
                    <div className="h-[500px]">
                      <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center bg-siasic-bg-secondary">
                          <div className="text-center">
                            <div className="w-10 h-10 border-4 border-siasic-accent-cyan/30 border-t-siasic-accent-cyan rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-siasic-text-muted text-sm">Cargando mapa...</p>
                          </div>
                        </div>
                      }>
                        <SimuladorMap resultado={resultado} />
                      </Suspense>
                    </div>
                  </div>
                ) : (
                  /* DATOS */
                  <>
                    {/* Resumen Principal */}
                    <div className="bg-siasic-bg-card border border-siasic-accent-cyan/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-siasic-text-primary mb-4">
                        Resultados de la Simulación
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Magnitud</p>
                          <p className="text-3xl font-bold text-siasic-accent-cyan">M{resultado.magnitud.toFixed(1)}</p>
                        </div>
                        
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Profundidad</p>
                          <p className="text-3xl font-bold text-siasic-nido">{resultado.profundidad} km</p>
                          <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block
                            ${resultado.tipo_profundidad === "Nido Sísmico" 
                              ? "bg-siasic-nido/20 text-siasic-nido" 
                              : resultado.tipo_profundidad === "Superficial"
                              ? "bg-siasic-superficial/20 text-siasic-superficial"
                              : resultado.tipo_profundidad === "Intermedio"
                              ? "bg-siasic-intermedio/20 text-siasic-intermedio"
                              : "bg-siasic-profundo/20 text-siasic-profundo"
                            }`}
                          >
                            {resultado.tipo_profundidad}
                          </p>
                        </div>
                        
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Intensidad</p>
                          <p className="text-3xl font-bold" style={{ color: getMercalliColor(resultado.mercalli) }}>
                            {resultado.mercalli}
                          </p>
                          <p className="text-xs text-siasic-text-muted mt-1">Mercalli</p>
                        </div>
                        
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Energía TNT</p>
                          <p className="text-2xl font-bold text-siasic-intermedio">
                            {resultado.energia_tnt_toneladas >= 1000 
                              ? `${(resultado.energia_tnt_toneladas / 1000).toFixed(1)}k`
                              : resultado.energia_tnt_toneladas.toFixed(0)
                            }
                          </p>
                          <p className="text-xs text-siasic-text-muted mt-1">toneladas</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-siasic-bg-secondary/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info size={16} className="text-siasic-accent-cyan mt-0.5" />
                          <p className="text-siasic-text-secondary text-sm">
                            <span className="font-medium text-siasic-text-primary">Escala Mercalli {resultado.mercalli}:</span>{" "}
                            {resultado.mercalli_descripcion}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zonas de Impacto */}
                    <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-siasic-intermedio" />
                        Zonas de Impacto
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {resultado.zonas.map((zona, idx) => (
                          <div 
                            key={idx}
                            className="p-4 rounded-lg border"
                            style={{ backgroundColor: `${zona.color}10`, borderColor: `${zona.color}30` }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold" style={{ color: zona.color }}>{zona.nombre}</h4>
                              <span className="text-xs bg-siasic-bg-secondary px-2 py-1 rounded">{zona.radio_km} km</span>
                            </div>
                            <p className="text-siasic-text-secondary text-sm">Intensidad: {zona.intensidad}</p>
                            <p className="text-siasic-text-muted text-xs mt-1">{zona.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ciudades Afectadas */}
                    <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-siasic-text-primary mb-4 flex items-center gap-2">
                        <Users size={18} className="text-siasic-profundo" />
                        Ciudades Afectadas
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-siasic-text-muted text-sm border-b border-siasic-bg-secondary">
                              <th className="pb-3 font-medium">Ciudad</th>
                              <th className="pb-3 font-medium">Distancia</th>
                              <th className="pb-3 font-medium">Población</th>
                              <th className="pb-3 font-medium">Intensidad</th>
                              <th className="pb-3 font-medium">Mercalli</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-siasic-bg-secondary">
                            {resultado.ciudades_afectadas.map((ciudad, idx) => (
                              <tr key={idx} className="text-siasic-text-secondary">
                                <td className="py-3 font-medium text-siasic-text-primary">{ciudad.ciudad}</td>
                                <td className="py-3">{ciudad.distancia_km.toFixed(1)} km</td>
                                <td className="py-3">{ciudad.poblacion.toLocaleString()}</td>
                                <td className="py-3">{ciudad.intensidad.toFixed(1)}</td>
                                <td className="py-3">
                                  <span 
                                    className="px-2 py-1 rounded text-xs font-medium"
                                    style={{ backgroundColor: `${getMercalliColor(ciudad.mercalli)}20`, color: getMercalliColor(ciudad.mercalli) }}
                                  >
                                    {ciudad.mercalli}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Predicción de Réplicas */}
                    <div className="bg-siasic-bg-card border border-siasic-nido/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-siasic-text-primary mb-2 flex items-center gap-2">
                        <Clock size={18} className="text-siasic-nido" />
                        Predicción de Réplicas (Omori-Utsu)
                      </h3>
                      <p className="text-siasic-text-muted text-sm mb-4">
                        Estimación de réplicas en los próximos 14 días
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Total (14 días)</p>
                          <p className="text-3xl font-bold text-siasic-nido">{resultado.total_replicas_14_dias}</p>
                        </div>
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center">
                          <p className="text-siasic-text-muted text-sm">Máx. Magnitud</p>
                          <p className="text-3xl font-bold text-siasic-intermedio">M{resultado.max_replica_magnitud.toFixed(1)}</p>
                        </div>
                        <div className="bg-siasic-bg-secondary/50 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                          <p className="text-siasic-text-muted text-sm">Réplicas Día 1</p>
                          <p className="text-3xl font-bold text-siasic-accent-cyan">
                            {resultado.replicas_prediccion[0]?.tasa_replicas.toFixed(0) || 0}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {resultado.replicas_prediccion.slice(0, 7).map((rep) => (
                          <div key={rep.dia} className="flex items-center gap-3">
                            <span className="text-siasic-text-muted text-sm w-16">Día {rep.dia}</span>
                            <div className="flex-1 bg-siasic-bg-secondary rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-siasic-nido to-siasic-accent-cyan rounded-full"
                                style={{ width: `${Math.min((rep.tasa_replicas / resultado.replicas_prediccion[0].tasa_replicas) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-siasic-text-primary text-sm w-12 text-right">{rep.tasa_replicas.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}