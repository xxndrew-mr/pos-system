import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. PASTIKAN BARIS INI ADA (Import Provider)
import { NextAuthProvider } from "./providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikasi Kasir",
  description: "Sistem Manajemen Toko",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. PASTIKAN 'NextAuthProvider' MEMBUNGKUS {children} SEPERTI INI */}
        <NextAuthProvider>
            {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}