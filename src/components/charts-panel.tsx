"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatCompact, formatCurrency, formatDate } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import { Loader2 } from "lucide-react";

type Summary = {
  ranges: Record<string, any>;
  trend: { date: string; income: number; expense: number; balance: number }[];
  monthlyTrend: { month: string; income: number; expense: number; balance: number }[];
  byCategory: {
    name: string;
    color: string;
    icon: string;
    expense: number;
    income: number;
    total: number;
  }[];
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl border border-border/60 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function ChartsPanel() {
  const { data, isLoading } = useQuery<Summary>({
    queryKey: ["summary"],
    queryFn: async () => {
      const r = await fetch("/api/summary");
      return r.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const trendData = (data?.trend ?? []).map((t) => ({
    ...t,
    label: new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
  }));
  const monthlyData = data?.monthlyTrend ?? [];
  const catData = (data?.byCategory ?? []).filter((c) => c.total > 0);
  const totalCat = catData.reduce((a, b) => a + b.total, 0);

  return (
    <div className="space-y-4">
      {/* 7-day trend */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">Tren 7 Hari Terakhir</h3>
            <p className="text-xs text-muted-foreground">Pemasukan vs pengeluaran harian</p>
          </div>
          <div className="flex gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Masuk
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Keluar
            </div>
          </div>
        </div>
        <div className="h-[180px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v as number)} width={42} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={2} fill="url(#gIn)" />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" strokeWidth={2} fill="url(#gOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 6-month trend */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-sm">Tren 6 Bulan Terakhir</h3>
            <p className="text-xs text-muted-foreground">Perbandingan bulanan</p>
          </div>
          <div className="h-[180px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v as number)} width={42} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", className: "text-muted", opacity: 0.4 }} />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category breakdown */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-sm">Aktivitas per Kategori</h3>
            <p className="text-xs text-muted-foreground">Bulan ini (pemasukan + pengeluaran)</p>
          </div>
          {catData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
              Belum ada data bulan ini
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-[140px] w-[140px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {catData.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground">Total</span>
                  <span className="text-sm font-bold tabular-nums">{formatCompact(totalCat)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
                {catData.slice(0, 6).map((c) => {
                  const pct = totalCat > 0 ? (c.total / totalCat) * 100 : 0;
                  return (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: c.color + "22" }}
                      >
                        <Icon name={c.icon} className="w-3 h-3" style={{ color: c.color }} />
                      </span>
                      <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                      <span className="font-semibold tabular-nums">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
                {catData.length > 6 && (
                  <p className="text-[10px] text-muted-foreground pt-1">+{catData.length - 6} lainnya</p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
