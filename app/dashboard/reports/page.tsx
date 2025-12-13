"use client";
import { useState, useEffect, useRef } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Printer, FileText } from "lucide-react";

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
        // Mundur 7 hari
        start.setDate(today.getDate() - 7);
    } else if (mode === "MONTH") {
        // Set ke tanggal 1 bulan ini
        start.setDate(1); 
    }

    // Format ke YYYY-MM-DD untuk input date HTML
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const fetchReport = async () => {
    const res = await fetch(`/api/reports?start=${startDate}&end=${endDate}`);
    const json = await res.json();
    setData(json);
  };

  // Fungsi Cetak (Akan mencetak area div "printRef")
  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="p-10 text-center">Memuat Laporan...</div>;

  const { summary, dailyBreakdown, transactions, expenses } = data;

  return (
    <div className="space-y-6">
      
      {/* --- HEADER CONTROLS (TIDAK TERCETAK) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan</h1>
            <p className="text-slate-500 text-sm">Analisis performa penjualan toko</p>
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
                <Printer size={18}/> Cetak / PDF
            </button>
        </div>
      </div>

      {/* Input Tanggal Manual (Jika butuh custom range) */}
      <div className="flex gap-2 items-center bg-white p-3 rounded-lg shadow-sm w-fit print:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase">Custom Tanggal:</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
            <span className="text-slate-400">-</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border rounded px-2 py-1 text-sm"/>
      </div>


      {/* --- AREA YANG AKAN DICETAK (PRINT AREA) --- */}
      <div ref={printRef} className="print:w-full print:p-0">
        
        {/* Header Cetakan (Hanya muncul saat print) */}
        <div className="hidden print:block text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold uppercase">Laporan Keuangan Toko</h1>
            <p className="text-sm">Periode: {new Date(startDate).toLocaleDateString("id-ID")} s/d {new Date(endDate).toLocaleDateString("id-ID")}</p>
        </div>

        {/* --- [UPDATE BARU] HIGHLIGHT LABA BERSIH --- */}
        <div className="mb-6">
            <div className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                <h3 className="text-gray-500 text-sm font-bold">LABA BERSIH (NET PROFIT)</h3>
                <p className="text-xs text-gray-400 mb-1">(Omset - Modal Barang - Pengeluaran)</p>
                <div className="text-3xl font-bold text-indigo-700">
                    Rp {summary.netProfit.toLocaleString()}
                </div>
            </div>
        </div>

        {/* 1. KARTU RINGKASAN LAINNYA */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card title="Total Omset" value={summary.totalOmset} icon={<DollarSign/>} color="text-blue-600" bg="bg-blue-50" />
            <Card title="Laba Kotor" value={summary.grossProfit} icon={<TrendingUp/>} color="text-emerald-600" bg="bg-emerald-50" sub="Omset - Modal" />
            <Card title="Pengeluaran" value={summary.totalExpense} icon={<TrendingDown/>} color="text-rose-500" bg="bg-rose-50" />
            {/* Note: Card Laba Bersih yang kecil saya hapus karena sudah ada yang besar di atas */}
        </div>

        {/* 2. BREAKDOWN HARIAN (Tabel Analisis) */}
        <div className="mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={20}/> Rincian Per Hari</h3>
            <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
                    <tr>
                        <th className="p-3 border-b">Tanggal</th>
                        <th className="p-3 border-b text-right">Omset</th>
                        <th className="p-3 border-b text-right">Pengeluaran</th>
                        <th className="p-3 border-b text-right">Laba Bersih</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyBreakdown.map((day: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{day.date}</td>
                            <td className="p-3 text-right">Rp {day.omset.toLocaleString()}</td>
                            <td className="p-3 text-right text-rose-500">{day.expense > 0 ? `(Rp ${day.expense.toLocaleString()})` : '-'}</td>
                            <td className={`p-3 text-right font-bold ${day.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Rp {day.profit.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {dailyBreakdown.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">Tidak ada data.</td></tr>}
                </tbody>
            </table>
        </div>

        {/* 3. DETAIL TRANSAKSI (Opsional, di print mungkin panjang) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
            {/* Transaksi */}
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 border-b font-bold text-xs uppercase text-slate-500">Riwayat Transaksi Terakhir</div>
                <table className="w-full text-xs text-left">
                    <tbody>
                        {transactions.slice(0, 10).map((t: any) => (
                            <tr key={t.id} className="border-b last:border-0">
                                <td className="p-3">
                                    <div className="font-bold">{t.invoiceNo}</div>
                                    <div className="text-slate-400">{new Date(t.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="p-3 text-right font-medium">Rp {t.totalAmount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pengeluaran */}
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 border-b font-bold text-xs uppercase text-slate-500">Riwayat Pengeluaran</div>
                <table className="w-full text-xs text-left">
                     <tbody>
                        {expenses.map((e: any) => (
                            <tr key={e.id} className="border-b last:border-0">
                                <td className="p-3">
                                    <div className="font-medium">{e.name}</div>
                                    <div className="text-slate-400">{new Date(e.date).toLocaleDateString()}</div>
                                </td>
                                <td className="p-3 text-right text-rose-500 font-bold">- Rp {e.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* Style CSS Khusus Print (Sembunyikan Nav/Sidebar) */}
      <style jsx global>{`
        @media print {
          @page { margin: 20mm; size: A4; }
          body { background: white; }
          /* Sembunyikan elemen dashboard layout */
          nav, aside, button, .print\\:hidden { display: none !important; }
          /* Pastikan area print tampil penuh */
          .print\\:w-full { width: 100% !important; margin: 0; }
          /* Reset warna background untuk hemat tinta tapi tetap jelas */
          .bg-blue-50, .bg-emerald-50, .bg-rose-50, .bg-indigo-50 { background-color: white !important; border: 1px solid #ddd; }
        }
      `}</style>
    </div>
  );
}

// Komponen Card Sederhana
function Card({ title, value, icon, color, bg = "bg-white", sub, border = "border-transparent" }: any) {
    return (
        <div className={`${bg} border ${border} p-4 rounded-xl shadow-sm flex flex-col justify-between h-full`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{title}</p>
                <div className={`p-2 rounded-lg bg-white/50 ${color}`}>{icon}</div>
            </div>
            <div>
                <h3 className={`text-xl md:text-2xl font-bold ${color}`}>Rp {value.toLocaleString()}</h3>
                {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}