// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TYPE DEFINITION untuk Params (Next.js 15)
type Params = { params: Promise<{ id: string }> };

// DELETE: Hapus Produk
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params; // Wajib await
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Gagal hapus produk" }, { status: 500 });
  }
}

// PUT: Update Produk (Edit)
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params; // Wajib await
    const body = await req.json();
    
    // Ambil data yang mau diupdate
    const { name, barcode, price, costPrice, stock } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        barcode,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock),
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update produk" }, { status: 500 });
  }
}