import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const count = await db.user.count();
  if (count > 0) {
    console.log("Sudah ada user:", count);
    const u = await db.user.findFirst();
    console.log("Email:", u?.email);
    return;
  }
  const passwordHash = await bcrypt.hash("dompetku123", 10);
  const user = await db.user.create({
    data: { name: "Admin Demo", email: "admin@dompetku.local", passwordHash },
  });
  const defaultCategories = [
    { name: "Makanan & Minuman", type: "expense", icon: "utensils", color: "#f97316" },
    { name: "Transportasi", type: "expense", icon: "car", color: "#06b6d4" },
    { name: "Belanja", type: "expense", icon: "shopping-bag", color: "#ec4899" },
    { name: "Tagihan", type: "expense", icon: "receipt", color: "#ef4444" },
    { name: "Hiburan", type: "expense", icon: "film", color: "#a855f7" },
    { name: "Kesehatan", type: "expense", icon: "heart-pulse", color: "#14b8a6" },
    { name: "Pendidikan", type: "expense", icon: "graduation-cap", color: "#3b82f6" },
    { name: "Lainnya", type: "expense", icon: "ellipsis", color: "#64748b" },
    { name: "Gaji", type: "income", icon: "wallet", color: "#10b981" },
    { name: "Bonus", type: "income", icon: "gift", color: "#22c55e" },
    { name: "Investasi", type: "income", icon: "trending-up", color: "#84cc16" },
    { name: "Freelance", type: "income", icon: "laptop", color: "#0ea5e9" },
    { name: "Lainnya", type: "income", icon: "ellipsis", color: "#64748b" },
  ];
  await db.category.createMany({
    data: defaultCategories.map((c) => ({ ...c, userId: user.id })),
  });
  
  // Seed some demo transactions across the past few days
  const now = new Date();
  const txs = [
    { type: "income", amount: 5000000, description: "Gaji bulanan", daysAgo: 2, catName: "Gaji" },
    { type: "income", amount: 750000, description: "Proyek freelance", daysAgo: 1, catName: "Freelance" },
    { type: "expense", amount: 25000, description: "Kopi pagi", daysAgo: 0, catName: "Makanan & Minuman" },
    { type: "expense", amount: 18000, description: "Bensin motor", daysAgo: 0, catName: "Transportasi" },
    { type: "expense", amount: 45000, description: "Makan siang", daysAgo: 0, catName: "Makanan & Minuman" },
    { type: "expense", amount: 350000, description: "Belanja bulanan", daysAgo: 1, catName: "Belanja" },
    { type: "expense", amount: 500000, description: "Bayar listrik", daysAgo: 3, catName: "Tagihan" },
    { type: "expense", amount: 75000, description: "Tiket bioskop", daysAgo: 4, catName: "Hiburan" },
    { type: "income", amount: 200000, description: "Cashback investasi", daysAgo: 5, catName: "Investasi" },
    { type: "expense", amount: 120000, description: "Obat & vitamin", daysAgo: 6, catName: "Kesehatan" },
    { type: "expense", amount: 95000, description: "Pulsa & internet", daysAgo: 7, catName: "Tagihan" },
    { type: "expense", amount: 300000, description: "Buku & kursus online", daysAgo: 10, catName: "Pendidikan" },
    { type: "income", amount: 1000000, description: "Bonus proyek", daysAgo: 12, catName: "Bonus" },
    { type: "expense", amount: 220000, description: "Service kendaraan", daysAgo: 15, catName: "Transportasi" },
    { type: "expense", amount: 80000, description: "Makan malam keluarga", daysAgo: 18, catName: "Makanan & Minuman" },
    { type: "expense", amount: 150000, description: "Pakaian baru", daysAgo: 25, catName: "Belanja" },
    { type: "expense", amount: 450000, description: "Cicilan kartu kredit", daysAgo: 40, catName: "Tagihan" },
    { type: "income", amount: 5000000, description: "Gaji bulan lalu", daysAgo: 35, catName: "Gaji" },
  ];
  for (const t of txs) {
    const cat = await db.category.findFirst({
      where: { userId: user.id, name: t.catName, type: t.type },
    });
    const date = new Date(now);
    date.setDate(date.getDate() - t.daysAgo);
    date.setHours(9 + (t.daysAgo % 10), 30, 0, 0);
    await db.transaction.create({
      data: {
        type: t.type,
        amount: t.amount,
        description: t.description,
        date,
        userId: user.id,
        categoryId: cat?.id ?? null,
      },
    });
  }
  console.log("Seed selesai. User:", user.email, "| Password: dompetku123");
  console.log("Total transaksi demo:", txs.length);
}

main().catch(console.error).finally(() => db.$disconnect());
