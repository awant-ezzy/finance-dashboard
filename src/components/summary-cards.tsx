"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatCompact } from "@/lib/utils";

export type SummaryRange = {
  from: string;
  to: string;
  income: number;
  expense: number;
  balance: number;
  count: number;
};

const ranges = [
  { key: "daily", label: "Hari Ini", icon: Calendar, color: "from-sky-500 to-cyan-600" },
  { key: "weekly", label: "Minggu Ini", icon: Wallet, color: "from-violet-500 to-purple-600" },
  { key: "monthly", label: "Bulan Ini", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { key: "yearly", label: "Tahun Ini", icon: TrendingDown, color: "from-amber-500 to-orange-600" },
] as const;

export function SummaryCards({ data }: { data: Record<string, SummaryRange> | undefined }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {ranges.map((r, i) => {
        const d = data?.[r.key];
        const Icon = r.icon;
        const balance = d?.balance ?? 0;
        return (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="relative overflow-hidden border-border/60 p-3 sm:p-4 hover:shadow-lg transition-shadow h-full">
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", r.color)} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">{r.label}</span>
                <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0", r.color)}>
                  <Icon className="w-3 sm:w-3.5 sm:h-3.5 h-3 text-white" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Saldo</div>
                  <div className={cn(
                    "text-sm sm:text-lg font-bold tabular-nums leading-tight break-words",
                    balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {formatCurrency(balance)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-[11px] pt-1">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Masuk
                    </span>
                    <span className="font-semibold tabular-nums truncate" title={formatCurrency(d?.income ?? 0)}>
                      {formatCompact(d?.income ?? 0)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      Keluar
                    </span>
                    <span className="font-semibold tabular-nums truncate" title={formatCurrency(d?.expense ?? 0)}>
                      {formatCompact(d?.expense ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
