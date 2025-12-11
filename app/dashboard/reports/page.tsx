"use client";
import { useState, useEffect } from "react";
import { Coins, TrendingUp, TrendingDown, Wallet, Calendar, Filter, FileText, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    const res = await fetch(`/api/reports?start=${startDate}&end=${endDate}`);
    const json = await res.json();
    setData(json);
  };

  if (!data) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
    </div>
  );

  const { summary, transactions, expenses } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <FileText size={20} />
                <span className="font-bold text-sm tracking-wide uppercase">Financial Overview</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Laporan Keuangan</h1>
            <p className="text-slate-500 mt-1">Ringkasan performa bisnis dan arus kas Anda.</p>
          </div>

          <div className="bg-white p-2 pl-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Periode:</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <input
                    type="date"
                    value={startDate}
                    onChange={e=>setStartDate(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                />
                <span className="text-slate-400">-</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={e=>setEndDate(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                />
            </div>

            <button
              onClick={fetchReport}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Filter size={16} /> Terapkan
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card 
            title="Total Omset" 
            value={summary.totalOmset} 
            icon={<Coins size={24} />} 
            colorClass="text-blue-600 bg-blue-50 border-blue-100" 
            trendIcon={<ArrowUpRight size={16}/>}
          />
          <Card 
            title="Laba Kotor" 
            value={summary.grossProfit} 
            icon={<TrendingUp size={24} />} 
            colorClass="text-emerald-600 bg-emerald-50 border-emerald-100" 
            sub="Omset - HPP"
          />
          <Card 
            title="Pengeluaran" 
            value={summary.totalExpense} 
            icon={<TrendingDown size={24} />} 
            colorClass="text-rose-600 bg-rose-50 border-rose-100" 
          />
          <Card 
            title="Laba Bersih" 
            value={summary.netProfit} 
            icon={<Wallet size={24} />} 
            colorClass="text-violet-600 bg-violet-50 border-violet-100" 
            isHighlight={true}
          />
        </div>

        {/* TABLES GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* TRANSAKSI */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Riwayat Penjualan
              </h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                {summary.transactionCount} Transaksi
              </span>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 pl-6">Invoice & Waktu</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4 pr-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-mono font-medium text-slate-800">{t.invoiceNo}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            t.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            t.paymentMethod === 'QRIS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                            <CreditCard size={12}/>
                            {t.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right font-mono font-bold text-slate-700">
                        Rp {t.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Belum ada transaksi pada periode ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PENGELUARAN */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                Riwayat Pengeluaran
              </h3>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 pl-6">Keterangan</th>
                    <th className="p-4 pr-6 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e: any) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-medium text-slate-800">{e.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(e.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                         <div className="font-mono font-bold text-rose-600">
                            - Rp {e.amount.toLocaleString()}
                         </div>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-300">
                            <TrendingDown size={32} className="mb-2 opacity-50"/>
                            <span className="text-slate-400 italic">Tidak ada pengeluaran tercatat.</span>
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
    </div>
  );
}

// Komponen Card yang dipercantik
function Card({ title, value, icon, colorClass, sub, isHighlight, trendIcon }: any) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md ${isHighlight ? 'bg-white shadow-lg border-violet-100 ring-1 ring-violet-100' : 'bg-white shadow-sm border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
        {trendIcon && (
            <div className="text-slate-400">
                {trendIcon}
            </div>
        )}
      </div>
      
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 font-mono tracking-tight">
            Rp {value.toLocaleString()}
        </h3>
        {sub ? (
            <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">{sub}</p>
        ) : (
            <div className="h-6"></div> // Spacer agar tinggi kartu seragam
        )}
      </div>
    </div>
  );
}