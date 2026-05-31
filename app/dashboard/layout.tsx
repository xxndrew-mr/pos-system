"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  Wallet,
  LogOut,
  Store,
  Menu,
  ChevronRight,
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navs = [
    { name: "Produk", href: "/dashboard/products", icon: Package },
    { name: "Laporan", href: "/dashboard/reports", icon: FileText },
    { name: "Pengeluaran", href: "/dashboard/expenses", icon: Wallet },
    { name: "Piutang/DP", href: "/dashboard/debts", icon: Wallet },
    { name: "Settings", href: "/dashboard/settings", icon: Wallet },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3 text-indigo-700 font-bold text-lg tracking-tight">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
            <LayoutDashboard size={22} />
          </div>
          <span className="leading-tight">Admin Butik Hijab Malaeka</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Main Menu
        </p>

        {navs.map((nav) => {
          const isActive = pathname.startsWith(nav.href);

          return (
            <Link
              key={nav.href}
              href={nav.href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-3">
                <nav.icon
                  size={20}
                  className={
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />
                <span>{nav.name}</span>
              </div>

              {isActive && (
                <ChevronRight size={16} className="text-indigo-400" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <p className="text-xs font-medium opacity-80 mb-1">Status Toko</p>
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Online
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>

        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-72 transition-all duration-300 min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-4 sm:px-6 md:px-8 flex justify-between items-center shadow-sm">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg shrink-0"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>

            <span className="font-bold text-slate-800 truncate">
              Admin Butik Hijab Malaeka
            </span>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block text-sm text-slate-500 font-medium">
            Selamat datang kembali,{" "}
            <span className="text-slate-800 font-bold">Administrator</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/pos"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm text-sm font-bold group"
            >
              <Store
                size={18}
                className="text-slate-400 group-hover:text-indigo-500"
              />
              Buka Kasir
            </Link>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}