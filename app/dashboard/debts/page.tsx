"use client";
import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Search } from "lucide-react";

export default function DebtPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    // Ambil data laporan range luas, nanti difilter di frontend yang statusnya PARTIAL
    // Idealnya buat API khusus GET /api/debts, tapi kita pakai API report biar cepat
    const res = await fetch(`/api/reports?start=2024-01-01&end=2030-12-31`); 
    const data = await res.json();
    // Filter hanya yang punya Hutang
    const debts = data.transactions.filter((t: any) => t.paymentStatus === 'PARTIAL' || t.debtAmount > 0);
    setTransactions(debts);
  };

  const handleRepay = async (id: string, name: string) => {
    if(!confirm(`Konfirmasi pelunasan untuk customer: ${name}?`)) return;
    
    setLoading(true);
    const res = await fetch(`/api/transactions/${id}/repay`, { method: "POST" });
    if(res.ok) {
        alert("Berhasil Lunas!");
        fetchDebts(); // Refresh data
    } else {
        alert("Gagal update data");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Buku Piutang (Konveksi)</h1>
            <p className="text-slate-500 text-sm">Daftar pesanan yang belum lunas / DP.</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <AlertCircle size={20}/> 
            Total Piutang: Rp {transactions.reduce((acc, t)=>acc+t.debtAmount, 0).toLocaleString()}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b font-bold text-slate-600 uppercase">
                <tr>
                    <th className="p-4">Invoice / Tanggal</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4 text-right">Total Tagihan</th>
                    <th className="p-4 text-right">Sudah Bayar (DP)</th>
                    <th className="p-4 text-right text-rose-600">Sisa Hutang</th>
                    <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-4">
                            <div className="font-bold text-indigo-600">{t.invoiceNo}</div>
                            <div className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 font-medium">{t.customerName || "Guest"}</td>
                        <td className="p-4 text-right">Rp {t.totalAmount.toLocaleString()}</td>
                        <td className="p-4 text-right text-emerald-600 font-bold">Rp {t.cashReceived.toLocaleString()}</td>
                        <td className="p-4 text-right text-rose-600 font-bold bg-rose-50">Rp {t.debtAmount.toLocaleString()}</td>
                        <td className="p-4 text-center">
                            <button 
                                onClick={() => handleRepay(t.id, t.customerName)}
                                disabled={loading}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 mx-auto"
                            >
                                <CheckCircle size={14}/> Lunasi
                            </button>
                        </td>
                    </tr>
                ))}
                {transactions.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Tidak ada piutang saat ini. Semua lunas! 🎉</td></tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}