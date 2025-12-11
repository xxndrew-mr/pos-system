import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua produk
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const barcode = searchParams.get("barcode");

  if (barcode) {
    const product = await prisma.product.findUnique({ where: { barcode } });
    return NextResponse.json({ product });
  }

  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ products });
}

// POST: Tambah produk (Auto-Generate Barcode Logic)
export async function POST(req: Request) {
  try {
    let { name, barcode, price, costPrice, stock } = await req.json();

    // LOGIKA BARU: Jika barcode kosong, generate otomatis
    if (!barcode || barcode.trim() === "") {
      // Generate angka acak 12 digit (biar kayak EAN-13)
      // Format: 899 + Timestamp 4 digit + Random 5 digit
      const prefix = "899"; 
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(10000 + Math.random() * 90000).toString();
      barcode = `${prefix}${timestamp}${random}`;
    }

    // Cek duplikat
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
    return NextResponse.json({ message: "Gagal simpan produk" }, { status: 500 });
  }
}