"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function DarkTooltip() {
  return (
    <Tooltip
      cursor={{ fill: "rgba(255,255,255,0.06)" }}
      contentStyle={{
        backgroundColor: "rgba(0,0,0,0.9)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        color: "white",
      }}
      labelStyle={{ color: "rgba(255,255,255,0.85)" }}
      itemStyle={{ color: "rgba(255,255,255,0.85)" }}
    />
  );
}

const axisTick = { fill: "rgba(255,255,255,0.75)", fontSize: 12 };
const axisLine = { stroke: "rgba(255,255,255,0.25)" };

export function TopChampsChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="font-semibold mb-3">Top Champions</div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={axisTick} axisLine={axisLine} tickLine={axisLine} interval={0} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
            <DarkTooltip />
            <Bar dataKey="count" fill="rgba(255,255,255,0.85)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RolesChart({
  data,
}: {
  data: { role: string; count: number }[];
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="font-semibold mb-3">Roles</div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
            <XAxis dataKey="role" tick={axisTick} axisLine={axisLine} tickLine={axisLine} interval={0} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={axisLine} tickLine={axisLine} />
            <DarkTooltip />
            <Bar dataKey="count" fill="rgba(255,255,255,0.85)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
