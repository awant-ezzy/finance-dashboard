"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pencil, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, relativeDay, formatTime } from "@/lib/utils";
import { Icon } from "@/lib/icons";
import type { TransactionItem } from "./transaction-dialog";

export function TransactionList({
  onEdit,
  refreshKey,
  limit,
}: {
  onEdit: (t: TransactionItem) => void;
  refreshKey?: number;
  limit?: number;
}) {
  const { data, isLoading } = useQuery<{ items: TransactionItem[]; total: number }>({
    queryKey: ["transactions", "list", refreshKey],
    queryFn: async () => {
      const r = await fetch(`/api/transactions?limit=${limit ?? 100}`);
      return r.json();
    },
  });

  const items = data?.items ?? [];

  // Group by date
  const groups: Record<string, TransactionItem[]> = {};
  for (const it of items) {
    const key = relativeDay(it.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(it);
  }
  const groupKeys = Object.keys(groups);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Belum ada transaksi</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Mulai catat pemasukan dan pengeluaran Anda untuk melihatnya di sini.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupKeys.map((g, gi) => {
        const groupItems = groups[g];
        const dayIncome = groupItems.filter((i) => i.type === "income").reduce((a, b) => a + b.amount, 0);
        const dayExpense = groupItems.filter((i) => i.type === "expense").reduce((a, b) => a + b.amount, 0);
        return (
          <div key={g}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g}
              </h3>
              <div className="text-[10px] text-muted-foreground tabular-nums">
                {dayIncome > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(dayIncome)}</span>}
                {dayIncome > 0 && dayExpense > 0 && <span className="mx-1">·</span>}
                {dayExpense > 0 && <span className="text-rose-600 dark:text-rose-400">-{formatCurrency(dayExpense)}</span>}
              </div>
            </div>
            <Card className="overflow-hidden p-0">
              {groupItems.map((t, i) => {
                const color = t.category?.color ?? (t.type === "income" ? "#10b981" : "#f43f5e");
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.05 + i * 0.02 }}
                    onClick={() => onEdit(t)}
                    className={`w-full text-left flex items-center gap-3 p-3 hover:bg-muted/60 transition-colors ${
                      i !== groupItems.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: color + "22" }}
                    >
                      <Icon name={t.category?.icon} className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{t.description}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {t.category?.name ?? "Tanpa kategori"}
                        <span>·</span>
                        <span>{formatTime(t.date)}</span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold tabular-nums ${
                        t.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </div>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                  </motion.button>
                );
              })}
            </Card>
          </div>
        );
      })}
      {data?.total > items.length && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          Menampilkan {items.length} dari {data.total} transaksi
        </p>
      )}
    </div>
  );
}
