import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start") || new Date().toISOString();
  const endDate = searchParams.get("end") || new Date().toISOString();

  // Konversi string ke Date object
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0); // Set jam 00:00:00
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Set jam 23:59:59

  try {
    // 1. Ambil Transaksi di rentang tanggal
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: { items: true } // Include items untuk hitung modal
    });

    // 2. Ambil Pengeluaran di rentang tanggal
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: start, lte: end }
      }
    });

    // --- HITUNG-HITUNGAN DUIT ---
    
    // Total Omset (Penjualan Kotor)
    const totalOmset = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

    // Total Modal (Dari harga modal barang yang terjual)
    let totalModal = 0;
    transactions.forEach((t) => {
        t.items.forEach((item) => {
            totalModal += (item.costAtTime * item.quantity);
        });
    });

    // Laba Kotor (Omset - Modal Barang)
    const grossProfit = totalOmset - totalModal;

    // Total Pengeluaran Operasional
    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Laba Bersih (Laba Kotor - Pengeluaran)
    const netProfit = grossProfit - totalExpense;

    return NextResponse.json({
      summary: {
        totalOmset,
        totalModal,
        grossProfit,
        totalExpense,
        netProfit,
        transactionCount: transactions.length
      },
      transactions, // Kirim list transaksi detail juga
      expenses      // Kirim list pengeluaran juga
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal ambil laporan" }, { status: 500 });
  }
}