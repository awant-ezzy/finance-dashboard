import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function startOfWeek(d: Date) {
  // Senin sebagai awal minggu
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Minggu
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  const ranges = {
    daily: { from: startOfDay(now), to: endOfDay(now) },
    weekly: { from: startOfWeek(now), to: endOfDay(now) },
    monthly: { from: startOfMonth(now), to: endOfDay(now) },
    yearly: { from: startOfYear(now), to: endOfDay(now) },
  };

  const keys = Object.keys(ranges) as (keyof typeof ranges)[];

  const result: any = {};

  for (const key of keys) {
    const { from, to } = ranges[key];
    const transactions = await db.transaction.findMany({
      where: { userId: user.id, date: { gte: from, lte: to } },
      select: { type: true, amount: true },
    });
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    result[key] = {
      from: from.toISOString(),
      to: to.toISOString(),
      income,
      expense,
      balance: income - expense,
      count: transactions.length,
    };
  }

  // Trend 7 hari terakhir (untuk mini chart)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const recent = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: sevenDaysAgo, lte: endOfDay(now) } },
    select: { type: true, amount: true, date: true },
  });
  const trend: { date: string; income: number; expense: number; balance: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dayStart = startOfDay(d);
    const dayEnd = endOfDay(d);
    let income = 0;
    let expense = 0;
    for (const t of recent) {
      if (t.date >= dayStart && t.date <= dayEnd) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    }
    trend.push({
      date: dayStart.toISOString(),
      income,
      expense,
      balance: income - expense,
    });
  }

  // Trend 6 bulan terakhir (untuk chart bulanan)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const recentMonths = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: sixMonthsAgo } },
    select: { type: true, amount: true, date: true },
  });
  const monthlyTrend: { month: string; income: number; expense: number; balance: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    let income = 0;
    let expense = 0;
    for (const t of recentMonths) {
      if (t.date >= monthStart && t.date <= monthEnd) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    }
    monthlyTrend.push({
      month: monthStart.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      income,
      expense,
      balance: income - expense,
    });
  }

  // Breakdown by category untuk bulan ini
  const monthStart = startOfMonth(now);
  const monthEnd = endOfDay(now);
  const byCategoryRaw = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: monthStart, lte: monthEnd } },
    include: { category: true },
  });
  const byCategoryMap = new Map<string, { name: string; color: string; icon: string; expense: number; income: number }>();
  for (const t of byCategoryRaw) {
    const key = t.category?.id ?? "uncategorized";
    const name = t.category?.name ?? "Tanpa Kategori";
    const color = t.category?.color ?? "#64748b";
    const icon = t.category?.icon ?? "ellipsis";
    if (!byCategoryMap.has(key)) {
      byCategoryMap.set(key, { name, color, icon, expense: 0, income: 0 });
    }
    const entry = byCategoryMap.get(key)!;
    if (t.type === "expense") entry.expense += t.amount;
    else entry.income += t.amount;
  }
  const byCategory = Array.from(byCategoryMap.values()).map((v) => ({
    ...v,
    total: v.expense + v.income,
  })).sort((a, b) => b.total - a.total);

  return NextResponse.json({
    ranges: result,
    trend,
    monthlyTrend,
    byCategory,
  });
}
