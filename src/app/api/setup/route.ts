import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// GET: cek apakah sudah ada user. POST: buat user pertama (open setup hanya jika belum ada user sama sekali).
export async function GET() {
  const count = await db.user.count();
  return NextResponse.json({ hasUser: count > 0, count });
}

export async function POST(req: Request) {
  try {
    const count = await db.user.count();
    if (count > 0) {
      return NextResponse.json(
        { error: "Setup sudah dilakukan. Silakan login." },
        { status: 400 }
      );
    }
    const body = await req.json();
    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().toLowerCase().trim();
    const password = (body?.password ?? "").toString();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, passwordHash },
    });

    // Buat kategori default
    const defaultCategories = [
      // expense
      { name: "Makanan & Minuman", type: "expense", icon: "utensils", color: "#f97316" },
      { name: "Transportasi", type: "expense", icon: "car", color: "#06b6d4" },
      { name: "Belanja", type: "expense", icon: "shopping-bag", color: "#ec4899" },
      { name: "Tagihan", type: "expense", icon: "receipt", color: "#ef4444" },
      { name: "Hiburan", type: "expense", icon: "film", color: "#a855f7" },
      { name: "Kesehatan", type: "expense", icon: "heart-pulse", color: "#14b8a6" },
      { name: "Pendidikan", type: "expense", icon: "graduation-cap", color: "#3b82f6" },
      { name: "Lainnya", type: "expense", icon: "ellipsis", color: "#64748b" },
      // income
      { name: "Gaji", type: "income", icon: "wallet", color: "#10b981" },
      { name: "Bonus", type: "income", icon: "gift", color: "#22c55e" },
      { name: "Investasi", type: "income", icon: "trending-up", color: "#84cc16" },
      { name: "Freelance", type: "income", icon: "laptop", color: "#0ea5e9" },
      { name: "Lainnya", type: "income", icon: "ellipsis", color: "#64748b" },
    ];

    await db.category.createMany({
      data: defaultCategories.map((c) => ({ ...c, userId: user.id })),
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat. Silakan login.",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
