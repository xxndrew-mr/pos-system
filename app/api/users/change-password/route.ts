import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions);
    
    // GANTI DISINI: Sekarang kita punya session.user.username yang valid!
    if (!session || !session.user?.username) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update berdasarkan USERNAME yang benar
    await prisma.user.update({
      where: { username: session.user.username }, // <-- Pakai username, bukan name
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });

  } catch (error) {
    console.error("Error ganti password:", error);
    return NextResponse.json({ message: "Gagal mengganti password" }, { status: 500 });
  }
}