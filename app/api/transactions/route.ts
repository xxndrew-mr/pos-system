// app/api/transactions/route.ts
import { NextResponse } from "next/server"; // <--- INI WAJIB ADA
import { prisma } from "@/lib/prisma";      // <--- INI WAJIB ADA

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Destructuring data dari body request
    const { items, totalAmount, paymentMethod, cashReceived, changeAmount, paymentProof } = body;

    // VALIDASI 1: Cek apakah keranjang kosong
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    // TRANSAKSI ATOMIK (Prisma Transaction)
    // Semua perintah di dalam sini harus sukses. Jika satu gagal, semua batal.
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Buat Header Transaksi
      const transaction = await tx.transaction.create({
        data: {
          invoiceNo: `INV-${Date.now()}`, // Generate nomor invoice unik pakai timestamp
          totalAmount: Number(totalAmount),
          paymentMethod: paymentMethod,
          cashReceived: Number(cashReceived) || 0,
          changeAmount: Number(changeAmount) || 0,
          paymentProof: paymentProof || null, // Simpan URL bukti transfer jika ada
        },
      });

      // 2. Loop setiap barang di keranjang
      for (const item of items) {
        // Cek stok terbaru di DB (mencegah race condition)
        const product = await tx.product.findUnique({
            where: { id: item.id }
        });

        if (!product) {
            throw new Error(`Produk tidak ditemukan: ${item.name}`);
        }

        if (product.stock < item.quantity) {
            throw new Error(`Stok tidak cukup untuk: ${item.name} (Sisa: ${product.stock})`);
        }

        // Simpan Detail Transaksi
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.id,
            quantity: item.quantity,
            priceAtTime: item.price,
            costAtTime: product.costPrice, // Penting untuk laporan laba rugi
          },
        });

        // 3. Kurangi Stok Produk
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity, // Kurangi stok sesuai jumlah beli
            },
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}