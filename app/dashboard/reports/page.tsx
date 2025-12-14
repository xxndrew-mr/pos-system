"use client";
import { useState, useEffect, useRef } from "react";
import { DollarSign, TrendingUp, TrendingDown, Printer, FileText, Store, Smartphone, ShoppingBag } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  
  // State Filter Tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeFilter, setActiveFilter] = useState("TODAY"); // TODAY, WEEK, MONTH

  // Ref untuk area yang mau dicetak
  const printRef = useRef(null);

  useEffect(() => {
    setFilter("TODAY"); // Default hari ini saat load pertama
  }, []);

  useEffect(() => {
    if(startDate && endDate) fetchReport();
  }, [startDate, endDate]);

  // Fungsi Helper Ganti Filter Cepat
  const setFilter = (mode: string) => {
    setActiveFilter(mode);
    const today = new Date();
    const start = new Date();

    if (mode === "TODAY") {
        // Start & End = Hari ini
    } else if (mode === "WEEK") {
        start.setDate(today.getDate() - 7);
    } else if (mode === "MONTH") {
        start.setDate(1); 
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const fetchReport = async () => {
    try {
        const res = await fetch(`/api/reports?start=${startDate}&end=${endDate}`);
        const json = await res.json();
        setData(json);
    } catch (error) {
        console.error("Gagal load report:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="p-10 text-center text-slate-500">Sedang Menghitung Laporan...</div>;

  const { summary, dailyBreakdown, transactions, expenses } = data;

  // --- LOGIC BARU: HITUNG PEMISAHAN PLATFORM ---
  // Kita filter manual dari data transactions yang didapat dari API
  const omsetToko = transactions
    .filter((t: any) => t.platform === 'TOKO' || !t.platform)
    .reduce((acc: number, t: any) => acc + t.totalAmount, 0);

  const omsetTikTok = transactions
    .filter((t: any) => t.platform === 'TIKTOK')
    .reduce((acc: number, t: any) => acc + t.totalAmount, 0);

  const omsetLainnya = transactions
    .filter((t: any) => t.platform !== 'TOKO' && t.platform !== 'TIKTOK')
    .reduce((acc: number, t: any) => acc + t.totalAmount, 0);
  // ---------------------------------------------

  return (
    <div className="space-y-6">
      
      {/* --- HEADER CONTROLS (TIDAK TERCETAK) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
            <p className="text-slate-500 text-sm">Analisis performa & pemisahan kas.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            {/* Tombol Filter Cepat */}
            <div className="flex bg-white rounded-lg border p-1 shadow-sm">
                <button onClick={() => setFilter("TODAY")} className={`px-3 py-1 text-sm rounded-md transition ${activeFilter==='TODAY' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>Hari Ini</button>
                <button onClick={() => setFilter("WEEK")} className={`px-3 py-1 text-sm rounded-md transition ${activeFilter==='WEEK' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>Minggu Ini</button>
                <button onClick={() => setFilter("MONTH")} className={`px-3 py-1 text-sm rounded-md transition ${activeFilter==='MONTH' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>Bulan Ini</button>
            </div>

            {/* Tombol Cetak */}
            <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 shadow-md">
                <Printer size={18}/> Cetak
            </button>
        </div>
      </div>

      {/* Input Tanggal Manual */}
      <div className="flex gap-2 items-center bg-white p-3 rounded-lg shadow-sm w-fit print:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase">Periode:</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
            <span className="text-slate-400">-</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
      </div>


      {/* --- AREA YANG AKAN DICETAK (PRINT AREA) --- */}
      <div ref={printRef} className="print:w-full print:p-0">
        
        {/* Header Cetakan */}
        <div className="hidden print:block text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">Laporan Kas & Omset</h1>
            <p className="text-sm">Periode: {new Date(startDate).toLocaleDateString("id-ID")} s/d {new Date(endDate).toLocaleDateString("id-ID")}</p>
        </div>

        {/* 1. HIGHLIGHT LABA BERSIH (NET PROFIT) */}
        <div className="mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-center">
                <div>
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Laba Bersih (Net Profit)</h3>
                    <p className="text-xs text-slate-400 mt-1">(Total Omset - Modal - Pengeluaran)</p>
                </div>
                <div className="text-4xl font-black text-indigo-700 font-mono">
                    Rp {summary.netProfit.toLocaleString()}
                </div>
            </div>
        </div>

        {/* 2. [BARU] PEMISAHAN PLATFORM (TOKO VS TIKTOK) */}
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
            <ShoppingBag size={18}/> Breakdown Sumber Pendapatan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Kartu Kas Toko */}
            <Card 
                title="Kas Toko (Offline)" 
                value={omsetToko} 
                icon={<Store size={20}/>} 
                color="text-emerald-700" 
                bg="bg-emerald-50" 
                border="border-emerald-100"
            />
            {/* Kartu Kas TikTok */}
            <Card 
                title="Kas TikTok Shop" 
                value={omsetTikTok} 
                icon={<Smartphone size={20}/>} 
                color="text-slate-800" 
                bg="bg-slate-100" 
                border="border-slate-200"
                sub="Live & Keranjang Kuning"
            />
            {/* Kartu Marketplace Lain */}
            <Card 
                title="Marketplace Lainnya" 
                value={omsetLainnya} 
                icon={<ShoppingBag size={20}/>} 
                color="text-orange-600" 
                bg="bg-orange-50" 
                border="border-orange-100"
                sub="Shopee / Tokopedia"
            />
        </div>

        {/* 3. RINGKASAN GLOBAL */}
        <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
            <DollarSign size={18}/> Ringkasan Keuangan Global
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card title="Total Semua Omset" value={summary.totalOmset} icon={<DollarSign/>} color="text-blue-600" bg="bg-blue-50" />
            <Card title="Total Laba Kotor" value={summary.grossProfit} icon={<TrendingUp/>} color="text-teal-600" bg="bg-teal-50" sub="Margin Keuntungan Produk" />
            <Card title="Total Pengeluaran" value={summary.totalExpense} icon={<TrendingDown/>} color="text-rose-500" bg="bg-rose-50" sub="Operasional & Gaji" />
        </div>

        {/* 4. TABEL ANALISIS HARIAN */}
        <div className="mb-8 page-break-inside-avoid">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20}/> Rincian Per Hari</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-3 border-b">Tanggal</th>
                            <th className="p-3 border-b text-right">Omset</th>
                            <th className="p-3 border-b text-right">Pengeluaran</th>
                            <th className="p-3 border-b text-right">Profit Bersih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {dailyBreakdown.map((day: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-3 font-medium">{day.date}</td>
                                <td className="p-3 text-right">Rp {day.omset.toLocaleString()}</td>
                                <td className="p-3 text-right text-rose-500">{day.expense > 0 ? `(Rp ${day.expense.toLocaleString()})` : '-'}</td>
                                <td className={`p-3 text-right font-bold ${day.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    Rp {day.profit.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 5. TABEL TRANSAKSI (Dengan Label Platform) */}
        <div className="mb-8">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShoppingBag size={20}/> 10 Transaksi Terakhir</h3>
             <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase border-b">
                        <tr>
                            <th className="p-3">Invoice</th>
                            <th className="p-3">Pelanggan & Sumber</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.slice(0, 10).map((t: any) => (
                            <tr key={t.id} className="hover:bg-slate-50">
                                <td className="p-3">
                                    <div className="font-bold text-slate-700">{t.invoiceNo}</div>
                                    <div className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="p-3">
                                    <div className="font-medium">{t.customerName || "Guest"}</div>
                                    {/* Badge Platform */}
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                                        t.platform === 'TIKTOK' ? 'bg-black text-white' : 
                                        t.platform === 'SHOPEE' ? 'bg-orange-100 text-orange-600' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {t.platform === 'TIKTOK' ? '🎵 TikTok' : (t.platform === 'TOKO' ? '🏪 Toko' : t.platform)}
                                    </span>
                                </td>
                                <td className="p-3 text-right font-bold">Rp {t.totalAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

      </div>

      {/* Style CSS Khusus Print */}
      <style jsx global>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { background: white; -webkit-print-color-adjust: exact; }
          nav, aside, button, .print\\:hidden { display: none !important; }
          .print\\:w-full { width: 100% !important; margin: 0; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

// Komponen Card
function Card({ title, value, icon, color, bg = "bg-white", sub, border = "border-transparent" }: any) {
    return (
        <div className={`${bg} border ${border} p-4 rounded-xl shadow-sm flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start mb-2">
                <p className={`text-xs font-bold uppercase tracking-wide opacity-70 ${color}`}>{title}</p>
                <div className={`p-2 rounded-lg bg-white/60 ${color}`}>{icon}</div>
            </div>
            <div>
                <h3 className={`text-2xl font-black ${color}`}>Rp {value.toLocaleString()}</h3>
                {sub && <p className="text-[10px] opacity-60 font-medium mt-1">{sub}</p>}
            </div>
        </div>
    );
}