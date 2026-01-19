// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander Frontend - Tipos TypeScript
// ═══════════════════════════════════════════════════════════════════════════

export type TipoProfundidad = "Superficial" | "Intermedio" | "Nido Sísmico" | "Profundo";

export interface Sismo {
  id: number;
  fecha_hora: string;
  latitud: number;
  longitud: number;
  profundidad: number;
  magnitud: number;
  tipo_magnitud: string;
  region: string;
  municipio: string | null;
  departamento: string;
  tipo_profundidad: TipoProfundidad;
  es_santander: boolean;
}

export interface SismoResumen {
  id: number;
  fecha_hora: string;
  magnitud: number;
  profundidad: number;
  municipio: string;
  tipo_profundidad: TipoProfundidad;
}

export interface EstadisticasGenerales {
  total_sismos: number;
  magnitud_promedio: number;
  magnitud_maxima: number;
  profundidad_promedio: number;
  sismos_santander: number;
  sismos_nido: number;
  ultimo_sismo: SismoResumen | null;
}

export interface DistribucionMensual {
  mes: string;
  cantidad: number;
  magnitud_promedio: number;
}

export interface DistribucionProfundidad {
  tipo: TipoProfundidad;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface SimuladorInput {
  latitud: number;
  longitud: number;
  magnitud: number;
  profundidad: number;
}

export interface ZonaImpacto {
  nombre: string;
  radio_km: number;
  intensidad: string;
  color: string;
  descripcion: string;
}

export interface CiudadAfectada {
  ciudad: string;
  poblacion: number;
  distancia_km: number;
  intensidad: number;
  mercalli: string;
  zona: string;
}

export interface PrediccionReplica {
  dia: number;
  tasa_replicas: number;
  acumulado: number;
  probabilidad_pct: number;
}

export interface SimuladorOutput {
  epicentro: { lat: number; lon: number };
  magnitud: number;
  profundidad: number;
  tipo_profundidad: TipoProfundidad;
  intensidad_epicentro: number;
  mercalli: string;
  mercalli_descripcion: string;
  energia_joules: number;
  energia_tnt_toneladas: number;
  zonas: ZonaImpacto[];
  ciudades_afectadas: CiudadAfectada[];
  replicas_prediccion: PrediccionReplica[];
  max_replica_magnitud: number;
  total_replicas_14_dias: number;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  data: T[];
}