import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.category.findMany({
    where: { userId: user.id },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = (body?.name ?? "").toString().trim();
  const type = body?.type === "income" ? "income" : "expense";
  const icon = (body?.icon ?? "ellipsis").toString();
  const color = (body?.color ?? "#64748b").toString();
  if (!name) {
    return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
  }
  const existing = await db.category.findFirst({
    where: { userId: user.id, name, type },
  });
  if (existing) {
    return NextResponse.json({ error: "Kategori sudah ada" }, { status: 400 });
  }
  const cat = await db.category.create({
    data: { name, type, icon, color, userId: user.id },
  });
  return NextResponse.json({ item: cat });
}
