import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const name = (body?.name ?? "").toString().trim();
  const type = body?.type === "income" ? "income" : "expense";
  const icon = (body?.icon ?? "ellipsis").toString();
  const color = (body?.color ?? "#64748b").toString();
  if (!name) {
    return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
  }
  const existing = await db.category.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }
  const dup = await db.category.findFirst({
    where: { userId: user.id, name, type, NOT: { id } },
  });
  if (dup) {
    return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 });
  }
  const cat = await db.category.update({
    where: { id },
    data: { name, type, icon, color },
  });
  return NextResponse.json({ item: cat });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await db.category.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }
  // Set null untuk transaksi yang pakai kategori ini
  await db.transaction.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
