import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua pengeluaran
export async function GET() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(expenses);
}

// POST: Tambah pengeluaran baru
export async function POST(req: Request) {
  try {
    const { name, amount, description } = await req.json();
    const expense = await prisma.expense.create({
      data: {
        name,
        amount: Number(amount),
        description,
        date: new Date(), // Default hari ini
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: "Gagal simpan" }, { status: 500 });
  }
}