import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } } // Bisa cari by Kategori juga
        ]
      },
      orderBy: { date: "desc" }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, amount, category } = body; // Ambil kategori dari input

    const expense = await prisma.expense.create({
      data: {
        name,
        amount: Number(amount),
        category: category || "Umum", // Kalau kosong, otomatis "Umum"
        date: new Date()
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: "Gagal simpan data" }, { status: 500 });
  }
}

// Tambahan: Delete Expense
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if(!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        await prisma.expense.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: "Gagal hapus" }, { status: 500 });
    }
}