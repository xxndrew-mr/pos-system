import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Buat Transaksi Baru (Support DP)
export async function POST(req: Request) {
  try {
    const { 
      items, totalAmount, paymentMethod, cashReceived, 
      paymentProof, customerName, platform 
    } = await req.json();

    // LOGIKA STATUS PEMBAYARAN (Retail & Konveksi)
    let status = "PAID";
    let debt = 0;

    // Jika metode DP (Termin)
    if (paymentMethod === 'DP') {
        status = "PARTIAL"; // Status: Belum Lunas
        debt = totalAmount - (Number(cashReceived) || 0); // Sisa Hutang
    }
    // Jika metode CASH tapi uang kurang (dianggap hutang)
    else if (paymentMethod === 'CASH' && (Number(cashReceived) || 0) < totalAmount) {
        status = "PARTIAL";
        debt = totalAmount - (Number(cashReceived) || 0);
    }
    
    // Generate Invoice
    const count = await prisma.transaction.count();
    const invoiceNo = `INV-${Date.now()}-${count + 1}`;

    const transaction = await prisma.transaction.create({
      data: {
        invoiceNo,
        totalAmount,
        paymentMethod, // Bisa CASH, QRIS, TRANSFER, atau DP
        cashReceived: Number(cashReceived),
        changeAmount: (status === "PAID" && Number(cashReceived) > totalAmount) ? Number(cashReceived) - totalAmount : 0,
        paymentProof,
        customerName: customerName || "Guest",
        platform: platform || "TOKO",
        paymentStatus: status, // PAID / PARTIAL
        debtAmount: debt,      // Nominal Hutang
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.qty,
            priceAtTime: item.price,
            costAtTime: item.costPrice
          }))
        }
      }
    });

    // Update Stok (Tetap berkurang walaupun DP, karena barang sudah di-keep/dijahit)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.qty } }
      });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal transaksi" }, { status: 500 });
  }
}