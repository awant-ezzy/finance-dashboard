"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { iconChoices, Icon } from "@/lib/icons";

const colorChoices = [
  "#10b981", "#f43f5e", "#f97316", "#06b6d4", "#ec4899",
  "#a855f7", "#14b8a6", "#3b82f6", "#84cc16", "#eab308",
  "#ef4444", "#64748b",
];

type CategoryItem = {
  id: string;
  name: string;
  type: string;
  icon: string | null;
  color: string | null;
};

function CategoryCard({
  c,
  onEdit,
  onDelete,
}: {
  c: CategoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = c.color ?? "#64748b";
  return (
    <Card className="p-3 flex items-center gap-2 group">
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "22" }}
      >
        <Icon name={c.icon} className="w-4 h-4" style={{ color }} />
      </span>
      <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-muted-foreground hover:text-rose-500"
          aria-label="Hapus"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}

function CategoryGroup({
  title,
  items,
  type,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  items: CategoryItem[];
  type: "income" | "expense";
  isLoading: boolean;
  onAdd: (type: "income" | "expense") => void;
  onEdit: (c: CategoryItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAdd(type)}
          className="h-7 text-xs gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">Belum ada kategori</Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((c) => (
            <CategoryCard
              key={c.id}
              c={c}
              onEdit={() => onEdit(c)}
              onDelete={() => onDelete(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewIcon({ icon, color, name }: { icon: string; color: string; name: string }) {
  return (
    <>
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: color + "22" }}
      >
        <Icon name={icon} className="w-4 h-4" style={{ color }} />
      </span>
      <span className="text-sm font-medium">{name || "Pratinjau"}</span>
    </>
  );
}

export function CategoryManager() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    icon: "ellipsis",
    color: "#64748b",
  });

  const { data, isLoading } = useQuery<{ items: CategoryItem[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await fetch("/api/categories");
      return r.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { ...form };
      if (editing) {
        const r = await fetch(`/api/categories/${editing.id}`, {
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
      const r = await fetch("/api/categories", {
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
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.error ?? "Gagal menghapus");
      }
      return r.json();
    },
    onSuccess: () => {
      toast.success("Kategori dihapus");
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghapus"),
  });

  const items = data?.items ?? [];
  const income = items.filter((i) => i.type === "income");
  const expense = items.filter((i) => i.type === "expense");

  function openNew(type: "income" | "expense") {
    setEditing(null);
    setForm({ name: "", type, icon: "ellipsis", color: type === "income" ? "#10b981" : "#f97316" });
    setOpen(true);
  }
  function openEdit(c: CategoryItem) {
    setEditing(c);
    setForm({ name: c.name, type: c.type as "income" | "expense", icon: c.icon ?? "ellipsis", color: c.color ?? "#64748b" });
    setOpen(true);
  }

  return (
    <div className="space-y-5">
      <CategoryGroup
        title="Pemasukan"
        items={income}
        type="income"
        isLoading={isLoading}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
      <CategoryGroup
        title="Pengeluaran"
        items={expense}
        type="expense"
        isLoading={isLoading}
        onAdd={openNew}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
            <DialogDescription>
              Atur kategori untuk klasifikasi transaksi Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Makanan"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ikon</Label>
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto scrollbar-thin p-1 rounded-lg border border-border">
                {iconChoices.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={`aspect-square rounded-md flex items-center justify-center transition-colors ${
                      form.icon === ic ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Icon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex flex-wrap gap-2">
                {colorChoices.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      form.color === c ? "ring-2 ring-offset-2 ring-offset-background scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <PreviewIcon icon={form.icon} color={form.color} name={form.name} />
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name.trim()}
              className="w-full h-11 gradient-primary text-white font-semibold"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
