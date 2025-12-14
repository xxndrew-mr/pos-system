import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    
    // Update transaksi jadi LUNAS
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: "PAID", // Ubah status
        debtAmount: 0,         // Hutang jadi 0
        // Opsional: Anda bisa update cashReceived bertambah, tapi hati-hati merusak hitungan omset harian.
        // Untuk akuntansi sederhana, kita anggap pelunasan masuk di hari ini, tapi di sistem ini kita update statusnya saja dulu.
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal pelunasan" }, { status: 500 });
  }
}