// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Gráfico de Profundidad (Donut)
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ProfundidadChartProps {
  data: Array<{
    tipo: string;
    cantidad: number;
    porcentaje: number;
    color: string;
  }>;
}

export default function ProfundidadChart({ data }: ProfundidadChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-siasic-bg-card border border-siasic-bg-secondary rounded-lg p-3">
          <p className="font-medium" style={{ color: item.color }}>{item.tipo}</p>
          <p className="text-siasic-text-secondary text-sm">
            {item.cantidad} sismos ({item.porcentaje}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-siasic-text-secondary text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="cantidad"
          nameKey="tipo"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}