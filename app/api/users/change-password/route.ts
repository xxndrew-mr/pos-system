// app/api/users/change-password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Pastikan import dari lib/auth
import * as bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log("1. Memulai proses ganti password..."); // LOG 1

    const session: any = await getServerSession(authOptions);
    console.log("2. Status Session:", session ? "ADA" : "KOSONG"); // LOG 2
    
    if (session) {
        console.log("3. User ID di Session:", session.user?.id); // LOG 3
    }

    if (!session || !session.user?.id) {
      console.log("ERROR: Session tidak ditemukan atau ID kosong.");
      return NextResponse.json({ message: "Unauthorized: Silakan login ulang" }, { status: 401 });
    }

    const { newPassword } = await req.json();
    console.log("4. Password baru diterima (panjang):", newPassword?.length);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.user.update({
      where: { id: session.user.id }, 
      data: { password: hashedPassword }
    });
    
    console.log("5. Sukses update user:", updated.id);

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error); // Ini akan muncul merah di log Vercel
    return NextResponse.json({ message: "Server Error: " + error.message }, { status: 500 });
  }
}