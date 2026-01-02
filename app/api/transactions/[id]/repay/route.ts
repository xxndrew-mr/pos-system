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

    // 2. Ambil data nominal bayar dari Frontend
    // Frontend mengirim: { amount: 50000 }
    const body = await req.json();
    const amountToPay = Number(body.amount);

    if (!amountToPay || amountToPay <= 0) {
        return NextResponse.json({ message: "Nominal pembayaran tidak valid" }, { status: 400 });
    }

    console.log(`Proses Pembayaran ID: ${id}, Nominal: ${amountToPay}`);

    // 3. Ambil data transaksi lama di Database
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    // 4. Validasi: Jangan sampai bayar lebih dari hutang
    if (amountToPay > transaction.debtAmount) {
         return NextResponse.json({ message: "Nominal bayar melebihi sisa hutang!" }, { status: 400 });
    }

    // 5. HITUNG LOGIKA BARU
    const newDebt = transaction.debtAmount - amountToPay;      // Sisa hutang berkurang
    // Pastikan kolom cashReceived ada di schema.prisma kamu
    // Jika kolomnya bernama lain, sesuaikan (misal: totalPaid)
    const newCashReceived = (transaction.cashReceived || 0) + amountToPay; 

    // Tentukan Status: Jika hutang 0 = PAID, jika masih ada = PARTIAL
    let newStatus = transaction.paymentStatus;
    if (newDebt <= 0) {
        newStatus = "PAID";
    } else {
        newStatus = "PARTIAL";
    }

    // 6. UPDATE DATABASE
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: newStatus,
        debtAmount: newDebt,
        cashReceived: newCashReceived
      }
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("GAGAL UPDATE PEMBAYARAN:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server Error: " + error.message 
    }, { status: 500 });
  }
}