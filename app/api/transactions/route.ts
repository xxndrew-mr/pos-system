// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { 
      items, totalAmount, paymentMethod, cashReceived, 
      paymentProof, customerName, platform 
    } = await req.json();

    // LOGIKA STATUS PEMBAYARAN
    let status = "PAID";
    let debt = 0;

    // Jika DP atau Cash Kurang -> Hutang
    if (paymentMethod === 'DP') {
        status = "PARTIAL";
        debt = totalAmount - (Number(cashReceived) || 0);
    } else if (paymentMethod === 'CASH' && (Number(cashReceived) || 0) < totalAmount) {
        status = "PARTIAL";
        debt = totalAmount - (Number(cashReceived) || 0);
    }
    
    const count = await prisma.transaction.count();
    const invoiceNo = `INV-${Date.now()}-${count + 1}`;

    const transaction = await prisma.transaction.create({
      data: {
        invoiceNo,
        totalAmount,
        paymentMethod: paymentMethod, // Pastikan Schema Prisma tipe datanya String!
        cashReceived: Number(cashReceived),
        changeAmount: (status === "PAID" && Number(cashReceived) > totalAmount) ? Number(cashReceived) - totalAmount : 0,
        paymentProof,
        customerName: customerName || "Guest",
        platform: platform || "TOKO",
        paymentStatus: status,
        debtAmount: debt,
        
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            
            // --- BAGIAN INI YANG DIPERBAIKI ---
            quantity: item.quantity, // DULU: item.qty (SALAH) -> SEKARANG: item.quantity (BENAR)
            // ----------------------------------
            
            priceAtTime: item.price,
            costAtTime: item.costPrice
          }))
        }
      }
    });

    // Update Stok
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } } // Disini juga pakai item.quantity
      });
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error); // Cek terminal jika masih error
    return NextResponse.json({ success: false, message: "Gagal transaksi" }, { status: 500 });
  }
}