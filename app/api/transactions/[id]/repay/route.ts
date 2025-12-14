import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Definisi Tipe Params untuk Next.js 15
type Params = {
  params: Promise<{ id: string }>
};

export async function POST(req: Request, { params }: Params) {
  try {
    // 1. Bongkar ID dari URL (Wajib await di Next.js 15)
    const { id } = await params;

    console.log("Melakukan Pelunasan untuk Invoice ID:", id);

    // 2. Cek apakah transaksi ada?
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // 3. Update Status jadi LUNAS (PAID)
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: "PAID", // Status jadi Lunas
        debtAmount: 0,         // Hutang jadi 0
        // updatedAt tidak kita update karena kolomnya tidak ada di schema
      }
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("GAGAL PELUNASAN:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server Error: " + error.message 
    }, { status: 500 });
  }
}