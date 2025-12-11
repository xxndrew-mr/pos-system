import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Convert file ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
    
    // Simpan ke folder public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    // Return URL file yang bisa diakses dari browser
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}