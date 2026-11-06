import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DompetKu — Pembukuan Pemasukan & Pengeluaran",
  description:
    "Aplikasi pembukuan pribadi modern. Catat pemasukan & pengeluaran, pantau ringkasan harian, mingguan, bulanan, dan tahunan.",
  keywords: [
    "pembukuan",
    "keuangan",
    "pengeluaran",
    "pemasukan",
    "dompet",
    "catatan keuangan",
  ],
  authors: [{ name: "DompetKu" }],
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "DompetKu — Pembukuan Pemasukan & Pengeluaran",
    description: "Catat pemasukan & pengeluaran dengan ringkasan harian, mingguan, bulanan, tahunan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a17" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster richColors position="top-center" />
      </body>
    </html>
  );
}
