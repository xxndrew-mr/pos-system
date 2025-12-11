// app/api/transactions/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Perhatikan tipe datanya Promise
) {
  // LANGKAH PENTING: Kita harus 'await' params terlebih dahulu
  const { id } = await params;

  // Validasi jika ID tidak ada
  if (!id) {
    return NextResponse.json({ message: "ID Transaksi diperlukan" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id }, // Sekarang 'id' sudah pasti berisi string, bukan undefined
    include: { 
      items: { 
        include: { product: true } 
      } 
    } 
  });

  if (!transaction) {
    return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(transaction);
}