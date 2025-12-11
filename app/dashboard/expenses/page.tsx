"use client";
import { useState, useEffect } from "react";
import { Trash, Plus, Wallet, Tag, Banknote, Calendar, Receipt } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", amount: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    const res = await fetch("/api/expenses");
    setExpenses(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" }
    });
    setForm({ name: "", amount: "", description: "" });
    fetchExpenses();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengeluaran ini?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
                <Wallet size={20} />
                <span className="font-bold text-sm tracking-wide uppercase">Operational Costs</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Pengeluaran</h1>
            <p className="text-slate-500 mt-1">Catat dan pantau biaya operasional bisnis Anda.</p>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="bg-rose-100 text-rose-600 p-0.5 rounded" size={20}/>
                    Catat Biaya Baru
                </h2>
            </div>
            
            <div className="p-6">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-5 items-end">
                
                    {/* Input Nama */}
                    <div className="w-full md:w-5/12">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Keterangan</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400"><Tag size={18}/></span>
                            <input
                                required
                                type="text"
                                placeholder="Cth: Bayar Listrik"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Input Jumlah */}
                    <div className="w-full md:w-4/12">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nominal</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400"><Banknote size={18}/></span>
                            <input
                                required
                                type="number"
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full md:w-3/12">
                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-rose-600 text-white py-2.5 rounded-xl hover:bg-rose-700 flex justify-center items-center gap-2 transition-all shadow-md shadow-rose-200 active:scale-95 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <>
                                    <Plus size={18} /> Simpan
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>

        {/* TABEL PENGELUARAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="p-5 pl-6">Tanggal & Keterangan</th>
                            <th className="p-5 text-right">Jumlah</th>
                            <th className="p-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {expenses.map((e: any) => (
                        <tr key={e.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="p-5 pl-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400 mt-1">
                                        <Receipt size={16}/>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800 text-base">{e.name}</div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Calendar size={12}/>
                                            {new Date(e.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td className="p-5 text-right">
                                <div className="inline-block px-3 py-1 bg-rose-50 rounded-lg border border-rose-100">
                                    <span className="text-rose-600 font-bold font-mono">
                                        - Rp {Number(e.amount).toLocaleString()}
                                    </span>
                                </div>
                            </td>

                            <td className="p-5 text-center">
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                                    title="Hapus Data"
                                >
                                    <Trash size={18} />
                                </button>
                            </td>
                        </tr>
                        ))}

                        {expenses.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-300">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <Receipt size={32} className="opacity-40"/>
                                    </div>
                                    <p className="text-slate-500 font-medium">Belum ada data pengeluaran.</p>
                                    <p className="text-sm opacity-60">Gunakan form di atas untuk mencatat biaya baru.</p>
                                </div>
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}