"use client";
import { useState, useEffect } from "react";
import { Plus, Trash, Search, TrendingDown, Tag } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [form, setForm] = useState({ name: "", amount: "", category: "" });

  useEffect(() => {
    fetchExpenses();
  }, [search]); // Auto refresh saat ngetik search

  const fetchExpenses = async () => {
    setLoading(true);
    // Kirim parameter search ke API
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
      setForm({ name: "", amount: "", category: "" }); // Reset form
      fetchExpenses(); // Refresh data
    } else {
      alert("Gagal menyimpan pengeluaran");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengeluaran ini?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      
      {/* HEADER & TOTAL */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="text-rose-600" /> Pengeluaran Operasional
          </h1>
          <p className="text-slate-500 text-sm">Catat semua biaya toko disini.</p>
        </div>
        <div className="bg-rose-50 text-rose-700 px-5 py-3 rounded-xl border border-rose-100 shadow-sm text-right">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Total Pengeluaran</p>
            <p className="text-2xl font-black">Rp {totalExpense.toLocaleString()}</p>
        </div>
      </div>

      {/* FORM INPUT BARU */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">Tambah Pengeluaran Baru</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Nama Pengeluaran</label>
                <input 
                    type="text" 
                    placeholder="Contoh: Beli Plastik" 
                    className="w-full border p-2.5 rounded-lg text-sm"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                />
            </div>
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Kategori (Ketik Aja)</label>
                <input 
                    type="text" 
                    placeholder="Contoh: ATK / Makanan" 
                    className="w-full border p-2.5 rounded-lg text-sm"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                />
            </div>
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-400 mb-1 block">Nominal (Rp)</label>
                <input 
                    type="number" 
                    placeholder="0" 
                    className="w-full border p-2.5 rounded-lg text-sm font-mono font-bold"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                />
            </div>
            <button type="submit" className="bg-slate-800 text-white p-2.5 rounded-lg font-bold hover:bg-slate-900 flex justify-center items-center gap-2">
                <Plus size={18} /> Simpan
            </button>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
            type="text" 
            placeholder="Cari nama pengeluaran atau kategori..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                    <Tag size={12}/> {item.category}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold text-rose-600">
                                Rp {item.amount.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="text-slate-400 hover:text-rose-500 transition"
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