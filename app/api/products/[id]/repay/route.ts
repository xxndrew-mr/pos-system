// app/api/transactions/[id]/repay/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params; // Next.js 15: Wajib await params

    console.log("Mencoba melunasi transaksi ID:", id); // Cek di terminal

    // Cek dulu apakah transaksi ada?
    const existing = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existing) {
      console.log("Transaksi tidak ditemukan!");
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    // Update jadi LUNAS
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: "PAID", 
        debtAmount: 0,         
      }
    });

    console.log("Berhasil lunas:", updated.invoiceNo);
    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    // INI PENTING: Tampilkan error asli di terminal VS Code
    console.error("GAGAL PELUNASAN:", error); 
    
    return NextResponse.json({ 
        success: false, 
        message: "Gagal update data. Cek terminal untuk detail." 
    }, { status: 500 });
  }
}