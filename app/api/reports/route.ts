import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start") || new Date().toISOString();
  const endDate = searchParams.get("end") || new Date().toISOString();
  
  // Konversi string ke Date object
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); 
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); 

  try {
    // 1. Ambil Transaksi & Pengeluaran di rentang tanggal
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'desc' }
    });

    // 2. HITUNG RINGKASAN TOTAL
    const totalOmset = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    
    let totalModal = 0;
    transactions.forEach((t) => {
        t.items.forEach((item) => {
            totalModal += (item.costAtTime * item.quantity);
        });
    });

    const grossProfit = totalOmset - totalModal;
    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossProfit - totalExpense;

    // 3. GROUPING DATA (Untuk Grafik/Tabel Harian)
    // Kita buat array ringkasan per hari agar bisa ditampilkan di tabel breakdown
    const breakdown: any = {};

    // Group Transaksi per Hari
    transactions.forEach(t => {
        const dateKey = new Date(t.createdAt).toLocaleDateString("id-ID"); // "13/12/2025"
        if (!breakdown[dateKey]) breakdown[dateKey] = { date: dateKey, omset: 0, expense: 0, profit: 0 };
        breakdown[dateKey].omset += t.totalAmount;
        
        // Hitung modal per transaksi untuk profit bersih per hari
        let tModal = 0;
        t.items.forEach(i => tModal += (i.costAtTime * i.quantity));
        breakdown[dateKey].profit += (t.totalAmount - tModal);
    });

    // Group Expense per Hari
    expenses.forEach(e => {
        const dateKey = new Date(e.date).toLocaleDateString("id-ID");
        if (!breakdown[dateKey]) breakdown[dateKey] = { date: dateKey, omset: 0, expense: 0, profit: 0 };
        breakdown[dateKey].expense += e.amount;
        breakdown[dateKey].profit -= e.amount; // Profit dikurangi pengeluaran
    });

    // Convert object ke array dan sort berdasarkan tanggal
    const dailyBreakdown = Object.values(breakdown);

    return NextResponse.json({
      summary: {
        totalOmset,
        totalModal,
        grossProfit,
        totalExpense,
        netProfit,
        transactionCount: transactions.length
      },
      dailyBreakdown, // Data baru: array per hari
      transactions,
      expenses
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil laporan" }, { status: 500 });
  }
}