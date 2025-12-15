"use client";
import { useState, useEffect } from "react";
import { Plus, Trash, Search, TrendingDown, Tag, PieChart, Wallet } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [form, setForm] = useState({ name: "", amount: "", category: "" });

  useEffect(() => {
    fetchExpenses();
  }, [search]); 

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await fetch(`/api/expenses?search=${search}`);
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.amount) return alert("Nama dan Nominal wajib diisi!");

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ name: "", amount: "", category: "" }); 
      fetchExpenses(); 
    } else {
      alert("Gagal menyimpan pengeluaran");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengeluaran ini?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  // 1. HITUNG TOTAL GLOBAL
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. LOGIC BARU: HITUNG TOTAL PER KATEGORI
  // Kita kelompokkan data berdasarkan nama kategorinya
  const categoryBreakdown = expenses.reduce((acc: any, curr: any) => {
    const catName = curr.category || "Umum"; // Kalau kosong masuk "Umum"
    if (!acc[catName]) {
        acc[catName] = 0;
    }
    acc[catName] += curr.amount;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      
      {/* HEADER */}
      <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="text-indigo-600" /> Manajemen Operasional
          </h1>
          <p className="text-slate-500 text-sm">Monitor arus kas keluar berdasarkan kategori.</p>
      </div>

      {/* --- STATISTIK & BREAKDOWN KATEGORI --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Card 1: Total Semua Pengeluaran */}
        <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Total Pengeluaran</p>
                    <h2 className="text-2xl font-black mt-1">Rp {totalExpense.toLocaleString()}</h2>
                </div>
                <div className="bg-white/20 p-2 rounded-lg"><TrendingDown size={20}/></div>
            </div>
            <p className="text-xs opacity-50 mt-4">{expenses.length} item transaksi</p>
        </div>

        {/* Card 2, 3, dst: Breakdown per Kategori */}
        {/* Kita tampilkan maksimal 3 kategori teratas, sisanya user bisa scroll di tabel */}
        {Object.entries(categoryBreakdown).map(([cat, amount]: any, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:border-indigo-300 transition">
                <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider truncate" title={cat}>{cat}</p>
                    <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-md"><Tag size={14}/></div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Rp {amount.toLocaleString()}</h3>
                    {/* Hitung Persentase sederhana */}
                    <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(amount / totalExpense) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* FORM INPUT BARU */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase flex items-center gap-2">
            <Plus size={16} className="text-indigo-600"/> Catat Pengeluaran
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Nama Pengeluaran</label>
                <input 
                    type="text" 
                    placeholder="Contoh: Beli Plastik" 
                    className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                />
            </div>
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Kategori</label>
                <input 
                    type="text" 
                    placeholder="Ketik Kategori (Misal: Makan)" 
                    className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                />
            </div>
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Nominal (Rp)</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full border p-2.5 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                />
            </div>
            <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 transition active:scale-95">
                Simpan
            </button>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
            type="text" 
            placeholder="Cari pengeluaran berdasarkan nama atau kategori..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-bold text-slate-500 uppercase text-xs">
                <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Keterangan</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4 text-right">Jumlah</th>
                    <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data pengeluaran.</td></tr>
                ) : (
                    expenses.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                            <td className="p-4 text-slate-500 font-mono text-xs">
                                {new Date(item.date).toLocaleDateString()}
                            </td>
                            <td className="p-4 font-bold text-slate-700">{item.name}</td>
                            <td className="p-4">
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                                    <Tag size={12}/> {item.category}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold text-rose-600">
                                Rp {item.amount.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="text-slate-400 hover:text-rose-500 transition p-2 hover:bg-rose-50 rounded-full"
                                >
                                    <Trash size={16} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

    </div>
  );
}