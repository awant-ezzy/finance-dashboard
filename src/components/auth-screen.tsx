"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function AuthScreen({ hasUser }: { hasUser: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "setup">(hasUser ? "login" : "setup");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "setup") {
        const res = await fetch("/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Gagal membuat akun");
          setLoading(false);
          return;
        }
        toast.success("Akun dibuat! Mengalihkan ke login...");
        setMode("login");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error(result.error || "Email atau password salah");
        setLoading(false);
        return;
      }
      toast.success("Berhasil masuk!");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-chart-4/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl shadow-2xl border border-border/60 p-6 sm:p-8">
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.15 }}
              className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 mb-3"
            >
              <Wallet className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight">DompetKu</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login"
                ? "Masuk untuk mengelola keuangan Anda"
                : "Buat akun pertama Anda untuk memulai"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "setup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Budi Santoso"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoComplete="name"
                    className="h-11"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder={mode === "setup" ? "Minimal 6 karakter" : "••••••••"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete={mode === "setup" ? "new-password" : "current-password"}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 gradient-primary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Buat Akun
                </>
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => setMode("setup")}
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Daftar di sini <ArrowRight className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Password di-hash dengan bcrypt. Data tersimpan di server Anda.</span>
        </div>
      </motion.div>
    </div>
  );
}
