"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navs = [
    { name: "Produk", href: "/dashboard/products" },
    { name: "Laporan", href: "/dashboard/reports" }, // Akan dibuat nanti
    { name: "Pengeluaran", href: "/dashboard/expenses" }, // Akan dibuat nanti
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar Atas */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-600">Admin Panel</div>
        <div className="space-x-4">
            <Link href="/pos" className="text-gray-600 hover:text-blue-600">Buka Kasir</Link>
            <button 
                onClick={() => signOut({ callbackUrl: "/" })} 
                className="text-red-500 font-medium"
            >
                Logout
            </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar Sederhana */}
        <aside className="w-64 bg-white border-r hidden md:block">
          <ul className="p-4 space-y-2">
            {navs.map((nav) => (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  className={`block px-4 py-2 rounded ${
                    pathname.startsWith(nav.href) 
                    ? "bg-blue-50 text-blue-600 font-bold" 
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {nav.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}