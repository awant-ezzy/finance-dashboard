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
  const type = body?.type === "income" ? "income" : "expense";
  const amount = parseFloat(body?.amount);
  const description = (body?.description ?? "").toString().trim();
  const dateStr = body?.date;
  const categoryId = body?.categoryId ?? null;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Jumlah harus > 0" }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "Keterangan wajib diisi" }, { status: 400 });
  }
  if (!dateStr) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
  }

  const existing = await db.transaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  if (categoryId) {
    const cat = await db.category.findFirst({
      where: { id: categoryId, userId: user.id },
    });
    if (!cat) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
    }
  }

  const trx = await db.transaction.update({
    where: { id },
    data: {
      type,
      amount,
      description,
      date: new Date(dateStr),
      categoryId: categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json({ item: trx });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.transaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
  }
  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
