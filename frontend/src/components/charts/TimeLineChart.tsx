// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Gráfico de Timeline (Scatter)
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

interface Sismo {
  fecha_hora: string;
  magnitud: number;
  profundidad: number;
  tipo_profundidad: string;
  municipio: string;
}

interface TimelineChartProps {
  data: Sismo[];
}

export default function TimelineChart({ data }: TimelineChartProps) {
  // Procesar datos para el gráfico
  const chartData = data.slice(0, 100).map((sismo) => ({
    fecha: new Date(sismo.fecha_hora).getTime(),
    magnitud: sismo.magnitud,
    profundidad: sismo.profundidad,
    tipo: sismo.tipo_profundidad,
    municipio: sismo.municipio,
    // Color basado en tipo
    fill: sismo.tipo_profundidad === "Nido Sísmico" ? "#6B46C1" :
          sismo.tipo_profundidad === "Superficial" ? "#DC2626" :
          sismo.tipo_profundidad === "Intermedio" ? "#F59E0B" : "#2563EB"
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-3">
          <p className="font-bold" style={{ color: item.fill }}>
            M{item.magnitud.toFixed(1)}
          </p>
          <p className="text-siasic-text-secondary text-sm">{item.municipio}</p>
          <p className="text-siasic-text-muted text-xs">
            Prof: {item.profundidad.toFixed(0)} km
          </p>
          <p className="text-siasic-text-muted text-xs">
            {new Date(item.fecha).toLocaleDateString('es-CO')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
        <XAxis
          dataKey="fecha"
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={(value) => new Date(value).toLocaleDateString('es-CO', { month: 'short' })}
          stroke="#64748B"
          fontSize={11}
        />
        <YAxis
          dataKey="magnitud"
          name="Magnitud"
          stroke="#64748B"
          fontSize={11}
          domain={[1, 6]}
        />
        <ZAxis dataKey="profundidad" range={[50, 400]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          data={chartData}
          fill="#00d4aa"
        >
          {chartData.map((entry, index) => (
            <circle key={index} fill={entry.fill} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}