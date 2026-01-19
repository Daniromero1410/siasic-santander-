// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander Frontend - Cliente API
// ═══════════════════════════════════════════════════════════════════════════

import axios from "axios";
import {
  EstadisticasGenerales,
  DistribucionMensual,
  DistribucionProfundidad,
  Sismo,
  SimuladorInput,
  SimuladorOutput,
  PaginatedResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const sismosApi = {
  getEstadisticas: async (): Promise<EstadisticasGenerales> => {
    const { data } = await api.get("/api/sismos/stats/generales");
    return data;
  },

  getDistribucionMensual: async (): Promise<DistribucionMensual[]> => {
    const { data } = await api.get("/api/sismos/stats/mensual");
    return data;
  },

  getDistribucionProfundidad: async (): Promise<DistribucionProfundidad[]> => {
    const { data } = await api.get("/api/sismos/stats/profundidad");
    return data;
  },

  getTodos: async (): Promise<Sismo[]> => {
    const { data } = await api.get("/api/sismos/todos");
    return data;
  },

  getList: async (page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Sismo>> => {
    const { data } = await api.get("/api/sismos", { params: { page, per_page: perPage } });
    return data;
  },

  getById: async (id: number): Promise<Sismo> => {
    const { data } = await api.get(`/api/sismos/${id}`);
    return data;
  },

  getParaMapa: async (): Promise<Sismo[]> => {
    const { data } = await api.get("/api/sismos/viz/mapa");
    return data;
  },

  getTimeline: async (): Promise<Sismo[]> => {
    const { data } = await api.get("/api/sismos/viz/timeline");
    return data;
  },
};

export const simuladorApi = {
  simular: async (params: SimuladorInput): Promise<SimuladorOutput> => {
    const { data } = await api.post("/api/simulador", params);
    return data;
  },

  escenarioNido: async (magnitud: number = 5.0): Promise<SimuladorOutput> => {
    const { data } = await api.post(`/api/simulador/escenario-rapido?magnitud=${magnitud}`);
    return data;
  },

  getCiudades: async () => {
    const { data } = await api.get("/api/simulador/ciudades");
    return data;
  },

  getEscenarios: async () => {
    const { data } = await api.get("/api/simulador/escenarios-predefinidos");
    return data;
  },

  getEscalaMercalli: async () => {
    const { data } = await api.get("/api/simulador/escala-mercalli");
    return data;
  },
};

export const configApi = {
  getColores: async () => {
    const { data } = await api.get("/api/config/colores");
    return data;
  },

  healthCheck: async () => {
    const { data } = await api.get("/health");
    return data;
  },
};

export default api;