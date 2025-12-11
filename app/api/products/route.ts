import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan path ini benar, lihat catatan di bawah*

// *CATATAN PENTING:
// Jika Anda belum punya file lib/prisma.ts, buat dulu (lihat di bawah kode ini).

export async function GET(req: Request) {
  // Ambil query param untuk search (opsional)
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode");

  if (barcode) {
    // Cari 1 produk by barcode (untuk scan kasir nanti)
    const product = await prisma.product.findUnique({
      where: { barcode },
    });
    return NextResponse.json({ product });
  }

  // Ambil semua produk (untuk list admin)
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, barcode, price, costPrice, stock } = body;

    // Validasi sederhana
    if (!name || !barcode || !price) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Cek duplikat barcode
    const existing = await prisma.product.findUnique({ where: { barcode } });
    if (existing) {
      return NextResponse.json({ message: "Barcode sudah terdaftar!" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        barcode,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menyimpan produk" }, { status: 500 });
  }
}