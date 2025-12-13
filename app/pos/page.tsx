"use client";
import { useState, useRef, useEffect } from "react";
import { Trash, Search, LogOut, Upload, CheckCircle, CreditCard, Banknote, QrCode } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function PosPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // STATE PEMBAYARAN
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");

  // STATE BARU (REVISI)
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState("TOKO");

  // STATE TAMBAHAN
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // HITUNG TOTAL
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const kembalian = (Number(cashReceived) || 0) - totalAmount;

  // Auto Focus Barcode Input
  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  // --- LOGIC ---
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?barcode=${barcode}`);
      const data = await res.json();
      if (data.product) {
        addToCart(data.product);
        setBarcode("");
      } else {
        alert("Produk tidak ditemukan!");
        setBarcode("");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (paymentMethod === "TRANSFER" && !transferFile) return alert("Upload bukti transfer!");
    if (paymentMethod === "QRIS" && !isQRPaid) return alert("QRIS belum dikonfirmasi!");

    if (!confirm("Proses transaksi ini?")) return;

    let proofUrl = null;
    if (paymentMethod === "TRANSFER" && transferFile) {
        const form = new FormData();
        form.append("file", transferFile);
        const upload = await fetch("/api/upload", { method: "POST", body: form });
        const up = await upload.json();
        proofUrl = up.url;
    }

    const payload = {
        items: cart,
        totalAmount,
        paymentMethod,
        cashReceived: Number(cashReceived),
        paymentProof: proofUrl,
        customerName,
        platform
    };

    const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
        // Reset State
        setCart([]);
        setCashReceived("");
        setCustomerName("");
        setPlatform("TOKO");
        setTransferFile(null);
        setIsQRPaid(false);
        setPaymentMethod("CASH");
        
        if(confirm("Transaksi Berhasil! Cetak Struk?")) {
             window.open(`/pos/print/${result.data.id}`, '_blank', 'width=400,height=600');
        }
    } else {
        alert(result.message);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">

      {/* ================= LEFT SIDE (CART) ================= */}
      <div className="w-2/3 flex flex-col border-r border-slate-200 bg-white">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
                <h1 className="font-bold text-2xl text-indigo-700 tracking-tight">KASIR TOKO</h1>
                <p className="text-xs text-slate-400">Versi 1.0.0 • {new Date().toLocaleDateString()}</p>
            </div>
            <button onClick={() => signOut()} className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition p-2 hover:bg-rose-50 rounded-lg">
                <LogOut size={18} /> <span className="text-sm font-medium">Keluar</span>
            </button>
        </div>

        {/* Input Barcode */}
        <div className="p-5 bg-slate-50 border-b border-slate-100">
            <form onSubmit={handleScan} className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
                <input
                    ref={inputRef}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan Barcode / Ketik Kode Barang..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg shadow-sm font-mono"
                    autoFocus
                />
            </form>
        </div>

        {/* List Cart */}
        <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white sticky top-0 text-slate-500 text-xs font-bold uppercase tracking-wider shadow-sm z-10">
                    <tr>
                        <th className="p-4 rounded-l-lg">Produk</th>
                        <th className="p-4 text-center">Qty</th>
                        <th className="p-4 text-right">Subtotal</th>
                        <th className="p-4 text-center rounded-r-lg">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {cart.map((item) => (
                        <tr key={item.id} className="hover:bg-indigo-50/50 transition-colors group">
                            <td className="p-4">
                                <div className="font-bold text-slate-700">{item.name}</div>
                                <div className="text-xs text-slate-400 font-mono">{item.barcode}</div>
                            </td>
                            <td className="p-4 text-center">
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm">{item.quantity}</span>
                            </td>
                            <td className="p-4 text-right font-mono font-medium">
                                Rp {(item.price * item.quantity).toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition p-2 hover:bg-rose-50 rounded-full">
                                    <Trash size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {cart.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-20 text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-100 rounded-full"><Search size={32} className="opacity-20"/></div>
                                    <p>Keranjang masih kosong.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* ================= RIGHT SIDE (PAYMENT) ================= */}
      <div className="w-1/3 bg-slate-50 flex flex-col h-full border-l border-slate-200 shadow-xl z-20">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. INFORMASI PELANGGAN (Revisi) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Order</h3>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pelanggan</label>
                    <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Nama (Opsional)"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sumber Order</label>
                    <select 
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                        <option value="TOKO">🏪 Toko (Offline)</option>
                        <option value="TIKTOK">🎵 TikTok Shop</option>
                        <option value="SHOPEE">🧡 Shopee</option>
                    </select>
                </div>
            </div>

            {/* 2. METODE PEMBAYARAN */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Metode Bayar</h3>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setPaymentMethod("CASH")} 
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'CASH' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                        <Banknote size={20}/>
                        <span className="text-xs font-bold">Tunai</span>
                    </button>
                    <button 
                        onClick={() => setPaymentMethod("QRIS")} 
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'QRIS' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                        <QrCode size={20}/>
                        <span className="text-xs font-bold">QRIS</span>
                    </button>
                    <button 
                        onClick={() => setPaymentMethod("TRANSFER")} 
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'TRANSFER' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    >
                        <CreditCard size={20}/>
                        <span className="text-xs font-bold">Transfer</span>
                    </button>
                </div>
                
                {/* DETAIL INPUT BAYAR */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    {paymentMethod === 'CASH' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Uang Diterima</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-400 text-sm font-bold">Rp</span>
                                <input 
                                    type="number" 
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-lg font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            {Number(cashReceived) > 0 && (
                                <div className={`mt-2 p-3 rounded-lg text-center font-bold ${kembalian >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {kembalian >= 0 ? `Kembalian: Rp ${kembalian.toLocaleString()}` : `Kurang: Rp ${Math.abs(kembalian).toLocaleString()}`}
                                </div>
                            )}
                        </div>
                    )}

                    {paymentMethod === 'QRIS' && (
                        <div className="text-center">
                            <div className="bg-white p-4 inline-block border rounded-lg shadow-sm">
                                <QRCode value={`TOKOANDRE-${totalAmount}`} size={128} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Scan QRIS untuk bayar</p>
                            <button 
                                onClick={() => setIsQRPaid(!isQRPaid)}
                                className={`mt-3 w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${isQRPaid ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                            >
                                {isQRPaid ? <><CheckCircle size={16}/> Lunas</> : "Konfirmasi Lunas"}
                            </button>
                        </div>
                    )}

                    {paymentMethod === 'TRANSFER' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Upload Bukti Transfer</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {transferFile ? (
                                    <div className="text-emerald-600 font-bold text-sm flex flex-col items-center">
                                        <CheckCircle size={24} className="mb-1"/>
                                        {transferFile.name}
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm flex flex-col items-center">
                                        <Upload size={24} className="mb-1"/>
                                        <span>Klik untuk upload</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* BOTTOM FIXED TOTAL */}
        <div className="bg-white p-6 border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-4">
                <span className="text-slate-500 font-bold">Total Tagihan</span>
                <span className="text-3xl font-black text-indigo-700 font-mono">
                    Rp {totalAmount.toLocaleString()}
                </span>
            </div>
            <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? "Memproses..." : "PROSES PEMBAYARAN"}
            </button>
        </div>

      </div>
    </div>
  );
}