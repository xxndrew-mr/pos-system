// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      totalAmount,
      paymentMethod,
      cashReceived,
      paymentProof,
      customerName,
      platform,
    } = body;

    // ===============================
    // VALIDASI
    // ===============================
    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "Keranjang kosong" },
        { status: 400 }
      );
    }

    // ===============================
    // LOGIKA PEMBAYARAN & HUTANG
    // ===============================
    let paymentStatus: "PAID" | "UNPAID" = "PAID";
    let debtAmount = 0;

    // CASH tapi uang kurang → HUTANG
    if (paymentMethod === "CASH" && (cashReceived || 0) < totalAmount) {
      paymentStatus = "UNPAID";
      debtAmount = totalAmount - (cashReceived || 0);
    }

    // Metode BON / HUTANG
    if (paymentMethod === "DEBT") {
      paymentStatus = "UNPAID";
      debtAmount = totalAmount;
    }

    // Hitung kembalian (hanya jika cash & cukup)
    const changeAmount =
      paymentMethod === "CASH" && (cashReceived || 0) >= totalAmount
        ? (cashReceived || 0) - totalAmount
        : 0;

    // ===============================
    // TRANSAKSI ATOMIK (AMAN)
    // ===============================
    const result = await prisma.$transaction(async (tx) => {
      // Generate invoice unik
      const count = await tx.transaction.count();
      const invoiceNo = `INV-${Date.now()}-${count + 1}`;

      // 1️⃣ BUAT HEADER TRANSAKSI
      const transaction = await tx.transaction.create({
        data: {
          invoiceNo,
          totalAmount: Number(totalAmount),
          paymentMethod,
          cashReceived: Number(cashReceived) || 0,
          changeAmount,
          paymentProof: paymentProof || null,

          // DATA TAMBAHAN
          customerName: customerName || "Guest",
          platform: platform || "TOKO",
          paymentStatus,
          debtAmount,
        },
      });

      // 2️⃣ LOOP ITEM + CEK STOK + SIMPAN DETAIL
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Produk tidak ditemukan: ${item.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok tidak cukup untuk ${item.name} (Sisa: ${product.stock})`
          );
        }

        // Simpan detail transaksi
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.id,
            quantity: item.quantity,
            priceAtTime: item.price,
            costAtTime: product.costPrice,
          },
        });

        // Kurangi stok
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
