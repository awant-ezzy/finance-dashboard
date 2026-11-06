import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "IDR") {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function formatCompact(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("id-ID", opts ?? {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeDay(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff === -1) return "Besok";
  if (diff > 0 && diff < 7) return `${diff} hari lalu`;
  return formatDate(date);
}

export function toInputDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}
