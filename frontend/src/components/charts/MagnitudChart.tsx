// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Gráfico de Magnitudes
// ═══════════════════════════════════════════════════════════════════════════

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MagnitudChartProps {
  data: Array<{
    mes: string;
    cantidad: number;
    magnitud_promedio: number;
  }>;
}

export default function MagnitudChart({ data }: MagnitudChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
        <XAxis 
          dataKey="mes" 
          stroke="#64748B" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748B" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f2744",
            border: "1px solid #1a2d4a",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelStyle={{ color: "#00d4aa" }}
        />
        <Area
          type="monotone"
          dataKey="cantidad"
          stroke="#00d4aa"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCantidad)"
          name="Cantidad"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}