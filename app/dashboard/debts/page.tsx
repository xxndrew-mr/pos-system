"use client";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Search, Wallet, ArrowRight, FileText, XCircle, X, Banknote } from "lucide-react";

export default function DebtPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // STATE UNTUK MODAL BAYAR
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      // Mengambil data range luas
      const res = await fetch(`/api/reports?start=2024-01-01&end=2030-12-31`); 
      const data = await res.json();
      
      // Filter: Hanya yang punya sisa hutang > 0
      const debts = data.transactions.filter((t: any) => 
        (t.paymentStatus === 'PARTIAL' || t.debtAmount > 0) && t.paymentStatus !== 'PAID'
      );
      
      setTransactions(debts);
    } catch (error) {
      console.error("Gagal ambil data piutang:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. BUKA MODAL SAAT TOMBOL DIKLIK
  const openRepayModal = (transaction: any) => {
    setSelectedDebt(transaction);
    setRepayAmount(""); // Reset input
    setIsModalOpen(true);
  };

  // 2. PROSES PEMBAYARAN KE SERVER
  const handleSubmitRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;

    const amount = Number(repayAmount);
    
    // Validasi sederhana
    if (amount <= 0) return alert("Masukkan nominal pembayaran!");
    if (amount > selectedDebt.debtAmount) return alert("Nominal pembayaran melebihi sisa hutang!");

    if (!confirm(`Proses pembayaran sebesar Rp ${amount.toLocaleString()}?`)) return;

    setProcessing(true);
    try {
        // PERHATIAN: Pastikan API Backend kamu support body { amount: number }
        const res = await fetch(`/api/transactions/${selectedDebt.id}/repay`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount }) // Kirim nominal bayar
        });

        if (res.ok) {
            // --- OPTIMISTIC UPDATE UI (Agar tidak perlu reload) ---
            setTransactions(prev => {
                return prev.map(t => {
                    if (t.id === selectedDebt.id) {
                        const newDebt = t.debtAmount - amount;
                        const newCash = t.cashReceived + amount;
                        
                        // Jika hutang jadi 0, hapus dari list (tandai null nanti difilter)
                        if (newDebt <= 0) return null;

                        // Jika masih ada sisa, update angkanya
                        return { ...t, debtAmount: newDebt, cashReceived: newCash };
                    }
                    return t;
                }).filter(Boolean); // Hapus yang null (yang sudah lunas)
            });

            alert("Pembayaran berhasil dicatat!");
            setIsModalOpen(false);
        } else {
            const err = await res.json();
            alert("Gagal: " + (err.message || "Server error"));
        }
    } catch (err) {
        alert("Terjadi kesalahan koneksi.");
    } finally {
        setProcessing(false);
    }
  };

  // Logic Search / Filter Client-Side
  const filteredDebts = transactions.filter(t => 
    t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPiutang = transactions.reduce((acc, t)=> acc + t.debtAmount, 0);

  return (
    <div className="space-y-6 relative">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Wallet className="text-indigo-600" size={28}/> Buku Piutang
            </h1>
            <p className="text-slate-500 text-sm mt-1">Pantau pembayaran tertunda dan konveksi (DP).</p>
        </div>

        {/* Card Total Piutang */}
        <div className="bg-white border border-rose-100 p-4 rounded-xl shadow-sm flex items-center gap-4 min-w-[280px]">
            <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                <AlertCircle size={24}/>
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Belum Lunas</p>
                <p className="text-xl font-black text-rose-600 font-mono">
                    Rp {totalPiutang.toLocaleString()}
                </p>
            </div>
        </div>
      </div>

      {/* --- FILTER & SEARCH BAR --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={20}/>
            <input 
                type="text" 
                placeholder="Cari Nama Customer / No. Invoice..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-xs">
                    <tr>
                        <th className="p-4 w-1/4">Invoice Info</th>
                        <th className="p-4 w-1/4">Customer</th>
                        <th className="p-4 text-right">Total Tagihan</th>
                        <th className="p-4 text-right">Sudah Bayar</th>
                        <th className="p-4 text-right text-rose-600">Sisa Hutang</th>
                        <th className="p-4 text-center w-1/6">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data piutang...</td></tr>
                    ) : filteredDebts.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                                    {searchTerm ? (
                                        <>
                                            <XCircle size={48} className="opacity-20"/>
                                            <p>Tidak ditemukan data pencarian.</p>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={48} className="text-emerald-200"/>
                                            <p className="font-medium text-slate-600">Luar Biasa!</p>
                                            <p className="text-sm">Tidak ada piutang. Semua pembayaran lunas. 🎉</p>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        filteredDebts.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4 align-top">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-slate-400"/>
                                        <span className="font-bold text-indigo-600 group-hover:underline cursor-pointer">{t.invoiceNo}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 ml-6 mt-1">{new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-bold text-slate-700">{t.customerName || "Guest"}</div>
                                    <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{t.platform}</div>
                                </td>
                                <td className="p-4 text-right font-medium text-slate-600">Rp {t.totalAmount.toLocaleString()}</td>
                                <td className="p-4 text-right font-medium text-emerald-600">Rp {t.cashReceived.toLocaleString()}</td>
                                <td className="p-4 text-right">
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg font-bold border border-rose-100">
                                        Rp {t.debtAmount.toLocaleString()}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => openRepayModal(t)}
                                        className="bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto transition-all shadow-sm"
                                    >
                                        Bayar <ArrowRight size={14}/>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* ================= MODAL PEMBAYARAN CICILAN ================= */}
      {isModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header Modal */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Pembayaran Piutang</h3>
                        <p className="text-xs text-slate-500">{selectedDebt.invoiceNo} - {selectedDebt.customerName}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Body Modal */}
                <form onSubmit={handleSubmitRepay} className="p-6 space-y-5">
                    
                    {/* Info Sisa Hutang */}
                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                        <p className="text-xs font-bold text-rose-500 uppercase">Sisa Hutang Saat Ini</p>
                        <p className="text-3xl font-black text-rose-600 mt-1">
                            Rp {selectedDebt.debtAmount.toLocaleString()}
                        </p>
                    </div>

                    {/* Input Nominal */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">Masukan Nominal Bayar</label>
                        <div className="relative">
                            <Banknote className="absolute left-3 top-3.5 text-slate-400" size={20}/>
                            <input 
                                type="number" 
                                autoFocus
                                required
                                min={1}
                                max={selectedDebt.debtAmount}
                                value={repayAmount}
                                onChange={(e) => setRepayAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg text-slate-800"
                                placeholder="Contoh: 500000"
                            />
                        </div>
                        {repayAmount && (
                             <p className="text-xs text-slate-500 mt-2 text-right">
                                Sisa Hutang Setelah Bayar: <span className="font-bold text-indigo-600">Rp {(selectedDebt.debtAmount - Number(repayAmount)).toLocaleString()}</span>
                             </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
                        >
                            {processing ? "Memproses..." : "Simpan Pembayaran"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}