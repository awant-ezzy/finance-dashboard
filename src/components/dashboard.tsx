"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  LayoutGrid,
  Receipt,
  PieChart,
  Tags,
  Plus,
  Moon,
  Sun,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SummaryCards, type SummaryRange } from "./summary-cards";
import { ChartsPanel } from "./charts-panel";
import { TransactionList } from "./transaction-list";
import { TransactionDialog, type TransactionItem } from "./transaction-dialog";
import { CategoryManager } from "./category-manager";
import { toast } from "sonner";

type Tab = "overview" | "transactions" | "stats" | "categories" | "settings";

const navItems: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Beranda", icon: LayoutGrid },
  { key: "transactions", label: "Transaksi", icon: Receipt },
  { key: "stats", label: "Statistik", icon: PieChart },
  { key: "categories", label: "Kategori", icon: Tags },
  { key: "settings", label: "Pengaturan", icon: Settings },
];

export function Dashboard({ user }: { user: { id: string; name: string; email: string } }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [trxOpen, setTrxOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { setTheme } = useTheme();
  const qc = useQueryClient();

  const { data: summary } = useQuery<{ ranges: Record<string, SummaryRange> }>({
    queryKey: ["summary"],
    queryFn: async () => {
      const r = await fetch("/api/summary");
      return r.json();
    },
  });

  function openNew() {
    setEditing(null);
    setTrxOpen(true);
  }
  function openEdit(t: TransactionItem) {
    setEditing(t);
    setTrxOpen(true);
  }

  function handleSignOut() {
    signOut({ callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop sidebar + mobile top */}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-sidebar/50 backdrop-blur-sm p-4 sticky top-0 h-screen">
          <div className="flex items-center gap-2.5 px-2 py-3 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold leading-tight">DompetKu</div>
              <div className="text-[10px] text-muted-foreground">Pembukuan Pribadi</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.key}
                  onClick={() => setTab(it.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === it.key
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {it.label}
                </button>
              );
            })}
          </nav>

          <Button
            onClick={openNew}
            className="w-full h-11 gradient-primary text-white font-semibold shadow-lg shadow-primary/25 mb-3"
          >
            <Plus className="w-4 h-4" /> Tambah Transaksi
          </Button>

          <div className="rounded-xl border border-border/60 p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 h-8 text-xs"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-3.5 h-3.5" />
                Gelap
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-6">
          {/* Mobile header */}
          <header className="lg:hidden sticky top-0 z-30 glass border-b border-border/60">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="font-bold">DompetKu</div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setTheme("dark")}
                  aria-label="Mode gelap"
                >
                  <Moon className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => setTheme("light")}
                  aria-label="Mode terang"
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-rose-500"
                  onClick={handleSignOut}
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {tab === "overview" && (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Halo, {user.name.split(" ")[0]} 👋
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Berikut ringkasan keuangan Anda
                      </p>
                    </div>
                    <SummaryCards data={summary?.ranges} />
                    <ChartsPanel />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="font-semibold">Transaksi Terbaru</h2>
                        <button
                          onClick={() => setTab("transactions")}
                          className="text-xs text-primary hover:underline"
                        >
                          Lihat semua
                        </button>
                      </div>
                      <TransactionList onEdit={openEdit} limit={5} />
                    </div>
                  </>
                )}

                {tab === "transactions" && (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transaksi</h1>
                      <p className="text-sm text-muted-foreground">Semua catatan pemasukan & pengeluaran</p>
                    </div>
                    <SummaryCards data={summary?.ranges} />
                    <TransactionList onEdit={openEdit} refreshKey={refreshKey} />
                  </>
                )}

                {tab === "stats" && (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Statistik</h1>
                      <p className="text-sm text-muted-foreground">Analisis mendalam keuangan Anda</p>
                    </div>
                    <SummaryCards data={summary?.ranges} />
                    <ChartsPanel />
                  </>
                )}

                {tab === "categories" && (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Kategori</h1>
                      <p className="text-sm text-muted-foreground">Kelola kategori transaksi Anda</p>
                    </div>
                    <CategoryManager />
                  </>
                )}

                {tab === "settings" && (
                  <>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pengaturan</h1>
                      <p className="text-sm text-muted-foreground">Akun dan preferensi aplikasi</p>
                    </div>
                    <Card className="p-5">
                      <h3 className="font-semibold mb-4">Profil</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-5">
                      <h3 className="font-semibold mb-3">Tampilan</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setTheme("dark")}
                          className="flex-1 dark:bg-primary dark:text-primary-foreground dark:border-primary"
                        >
                          <Moon className="w-4 h-4" /> Mode Gelap
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setTheme("light")}
                          className="flex-1 bg-primary text-primary-foreground border-primary dark:bg-transparent dark:text-foreground dark:border-border"
                        >
                          <Sun className="w-4 h-4" /> Mode Terang
                        </Button>
                      </div>
                    </Card>
                    <Card className="p-5">
                      <h3 className="font-semibold mb-2">Keamanan & Data</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Data Anda tersimpan di server ini dengan password yang di-hash menggunakan bcrypt.
                        Klik tombol di bawah untuk keluar dari aplikasi.
                      </p>
                      <Button variant="outline" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4" /> Keluar
                      </Button>
                    </Card>
                    <p className="text-center text-xs text-muted-foreground pt-2">
                      DompetKu v1.0 · Dibuat untuk Proxmox/Ubuntu
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border/60 safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((it) => {
            const Icon = it.icon;
            const active = tab === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setTab(it.key)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[52px] relative"
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {it.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute -top-1.5 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile FAB */}
      <button
        onClick={openNew}
        className="lg:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full gradient-primary text-white shadow-xl shadow-primary/40 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Tambah transaksi"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TransactionDialog
        open={trxOpen}
        onOpenChange={(v) => {
          setTrxOpen(v);
          if (!v) {
            setEditing(null);
            setRefreshKey((k) => k + 1);
            qc.invalidateQueries({ queryKey: ["summary"] });
          }
        }}
        initial={editing}
      />
    </div>
  );
}
