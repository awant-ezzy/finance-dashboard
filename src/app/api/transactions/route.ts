import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type"); // "income" | "expense" | null
  const categoryId = searchParams.get("categoryId");
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "200");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const where: any = { userId: user.id };
  if (type === "income" || type === "expense") where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  if (q) {
    where.description = { contains: q };
  }

  const [items, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
      include: { category: true },
    }),
    db.transaction.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  // validate category if provided
  if (categoryId) {
    const cat = await db.category.findFirst({
      where: { id: categoryId, userId: user.id },
    });
    if (!cat) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 });
    }
  }

  const trx = await db.transaction.create({
    data: {
      type,
      amount,
      description,
      date: new Date(dateStr),
      userId: user.id,
      categoryId: categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json({ item: trx });
}
