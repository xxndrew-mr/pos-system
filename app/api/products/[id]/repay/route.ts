import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js 15: Params harus bertipe Promise
type Params = {
  params: Promise<{ id: string }>
};

export async function POST(req: Request, { params }: Params) {
  try {
    // 1. Wajib pakai 'await' untuk bongkar params
    const resolvedParams = await params;
    const id = resolvedParams.id;

    console.log("Mencoba melunasi ID:", id); // Cek log server

    // 2. Cek apakah transaksi ada?
    const existing = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existing) {
      console.log("Transaksi tidak ditemukan di database");
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // 3. Lakukan Update
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: "PAID",  // Status jadi Lunas
        debtAmount: 0,          // Hutang jadi 0   
      }
    });

    console.log("Sukses update:", updated.invoiceNo);
    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    // Ini akan memunculkan error asli di Terminal VS Code / Vercel Logs
    console.error("GAGAL API REPAY:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server Error: " + error.message 
    }, { status: 500 });
  }
}