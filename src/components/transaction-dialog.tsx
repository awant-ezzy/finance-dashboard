"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { toInputDate } from "@/lib/utils";
import { Icon } from "@/lib/icons";

const schema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Jumlah wajib diisi"),
  description: z.string().min(1, "Keterangan wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  categoryId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export type TransactionItem = {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string | null;
  category?: { id: string; name: string; color: string; icon: string | null } | null;
};

export function TransactionDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: TransactionItem | null;
}) {
  const qc = useQueryClient();
  const [defaultType, setDefaultType] = useState<"income" | "expense">("expense");

  const { data: categories } = useQuery<{ items: any[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories");
      return r.json();
    },
    enabled: open,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      amount: "",
      description: "",
      date: toInputDate(new Date()),
      categoryId: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (initial) {
        form.reset({
          type: initial.type as "income" | "expense",
          amount: String(initial.amount),
          description: initial.description,
          date: toInputDate(initial.date),
          categoryId: initial.categoryId ?? null,
        });
        setDefaultType(initial.type as "income" | "expense");
      } else {
        form.reset({
          type: defaultType,
          amount: "",
          description: "",
          date: toInputDate(new Date()),
          categoryId: null,
        });
      }
    }
  }, [open, initial, form, defaultType]);

  const watchedType = form.watch("type");
  const filteredCats = (categories?.items ?? []).filter((c) => c.type === watchedType);

  const saveMutation = useMutation({
    mutationFn: async (v: FormValues) => {
      const amount = parseFloat(v.amount.replace(/[^\d.-]/g, ""));
      const body = {
        type: v.type,
        amount,
        description: v.description,
        date: new Date(v.date).toISOString(),
        categoryId: v.categoryId || null,
      };
      if (initial) {
        const r = await fetch(`/api/transactions/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const e = await r.json();
          throw new Error(e.error ?? "Gagal menyimpan");
        }
        return r.json();
      }
      const r = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error ?? "Gagal menyimpan");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success(initial ? "Transaksi diperbarui" : "Transaksi ditambahkan");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!initial) return;
      const r = await fetch(`/api/transactions/${initial.id}`, { method: "DELETE" });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error ?? "Gagal menghapus");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Transaksi dihapus");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["summary"] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghapus"),
  });

  const onSubmit = (v: FormValues) => saveMutation.mutate(v);

  const amountValue = form.watch("amount");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Transaksi" : "Tambah Transaksi"}</DialogTitle>
          <DialogDescription>
            {initial ? "Ubah detail transaksi Anda" : "Catat pemasukan atau pengeluaran baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => {
                form.setValue("type", "expense");
                form.setValue("categoryId", null);
              }}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                watchedType === "expense"
                  ? "bg-gradient-to-br from-rose-500 to-orange-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                form.setValue("type", "income");
                form.setValue("categoryId", null);
              }}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                watchedType === "income"
                  ? "gradient-income text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="0"
                value={amountValue ? Number(amountValue.replace(/[^\d]/g, "")).toLocaleString("id-ID") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  form.setValue("amount", raw, { shouldValidate: true });
                }}
                className="h-12 pl-10 text-lg font-semibold tabular-nums"
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-xs text-rose-500">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              placeholder="Contoh: Makan siang di warteg"
              rows={2}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-xs text-rose-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={form.watch("categoryId") ?? "none"}
              onValueChange={(v) => form.setValue("categoryId", v === "none" ? null : v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tanpa kategori</SelectItem>
                {filteredCats.map((c) => {
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: c.color + "33" }}
                        >
                          <Icon name={c.icon} className="w-3 h-3" style={{ color: c.color }} />
                        </span>
                        {c.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal & Jam</Label>
            <Input
              id="date"
              type="datetime-local"
              {...form.register("date")}
              className="h-11"
            />
            {form.formState.errors.date && (
              <p className="text-xs text-rose-500">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {initial && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            )}
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 h-11 gradient-primary text-white font-semibold shadow-md"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? "Simpan Perubahan" : "Tambah Transaksi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
