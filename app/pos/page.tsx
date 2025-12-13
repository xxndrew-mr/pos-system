"use client";

import { useState, useRef, useEffect } from "react";
import { Trash, Search, LogOut, Upload, CheckCircle, CreditCard, Banknote, QrCode, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code"; // Import Library QR

export default function PosPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State Pembayaran
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState<string>(""); 
  
  // State Baru untuk Phase 5
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false); 

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Hitung Total
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const kembalian = (Number(cashReceived) || 0) - totalAmount;

  // Fokus otomatis ke input barcode
  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  // Fungsi Scan Produk
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Tambah ke Keranjang
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Fungsi Hapus Item
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // --- LOGIKA PROSES BAYAR FINAL ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    // VALIDASI PER METODE
    if (paymentMethod === "CASH" && Number(cashReceived) < totalAmount) {
      return alert("Uang tunai kurang!");
    }
    if (paymentMethod === "TRANSFER" && !transferFile) {
      return alert("Mohon upload bukti transfer!");
    }
    // Validasi QRIS: User harus klik tombol 'Simulasi Cek Status' dulu sampai jadi hijau
    if (paymentMethod === "QRIS" && !isQRPaid) {
      return alert("Pastikan pembayaran QRIS sudah dikonfirmasi (Klik tombol Simulasi)!");
    }

    if (!confirm("Proses transaksi ini?")) return;

    let proofUrl = null;

    // 1. Jika Transfer, Upload Gambar dulu
    if (paymentMethod === "TRANSFER" && transferFile) {
      const formData = new FormData();
      formData.append("file", transferFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) proofUrl = uploadData.url;
        else throw new Error("Gagal upload");
      } catch (err) {
        return alert("Gagal upload bukti transfer");
      }
    }

    // 2. Simpan Transaksi ke Backend
    try {
      const payload = {
        items: cart,
        totalAmount,
        paymentMethod,
        cashReceived: paymentMethod === "CASH" ? Number(cashReceived) : totalAmount,
        changeAmount: paymentMethod === "CASH" ? kembalian : 0,
        paymentProof: proofUrl, 
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        alert("Transaksi Berhasil!"); // Pesan sukses sederhana
        // Reset State
        setCart([]);
        setCashReceived("");
        setTransferFile(null);
        setIsQRPaid(false);
        setPaymentMethod("CASH");
        inputRef.current?.focus();
        if(confirm("Transaksi Berhasil! Cetak Struk?")) {
            // Buka tab baru ke halaman print
            window.open(`/pos/print/${result.data.id}`, '_blank', 'width=400,height=600');
        }
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (error) {
      alert("Error sistem saat transaksi");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* BAGIAN KIRI: List Produk & Scan */}
      <div className="w-2/3 flex flex-col border-r border-slate-200 bg-white">
        
        {/* Header Left */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                    POS
                </div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Kasir System</h1>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => signOut({callbackUrl:'/'})} className="px-4 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 font-medium text-sm border border-transparent hover:border-rose-100">
                    <LogOut size={16}/> Keluar
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <form onSubmit={handleScan} className="relative group">
            <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={20}/>
            </span>
            <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan Barcode / Ketik Kode Barang..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm text-lg"
                autoFocus
            />
            <div className="absolute right-4 top-4 text-xs text-slate-400 font-medium hidden group-focus-within:block">
                Tekan Enter
            </div>
          </form>
        </div>

        {/* Product Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Produk</th>
                            <th className="px-6 py-4 text-right">Harga</th>
                            <th className="px-6 py-4 text-center">Qty</th>
                            <th className="px-6 py-4 text-right">Subtotal</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {cart.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">Rp {item.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-bold text-xs border border-slate-200">
                                        {item.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold font-mono text-slate-800">
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => removeFromCart(item.id)} 
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                                        title="Hapus"
                                    >
                                        <Trash size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {cart.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Search size={48} className="mb-4 opacity-20"/>
                                        <p className="text-lg font-medium">Keranjang masih kosong</p>
                                        <p className="text-sm opacity-60">Scan barcode atau cari produk untuk memulai transaksi</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* BAGIAN KANAN: Pembayaran */}
      <div className="w-1/3 bg-slate-50 flex flex-col border-l border-slate-200 z-10 shadow-xl">
        
        {/* Total Display */}
        <div className="bg-slate-900 text-white p-8 pb-10 rounded-bl-[2.5rem] shadow-lg z-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <h2 className="text-indigo-200 text-sm font-medium tracking-wide uppercase mb-1">Total Tagihan</h2>
                <div className="text-5xl font-bold tracking-tight font-mono">
                    Rp {totalAmount.toLocaleString()}
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 -mt-6 z-10">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'CASH', icon: Banknote, label: 'Tunai' },
                        { id: 'QRIS', icon: QrCode, label: 'QRIS' },
                        { id: 'TRANSFER', icon: CreditCard, label: 'Transfer' }
                    ].map((m) => (
                        <button 
                            key={m.id} 
                            onClick={() => { setPaymentMethod(m.id); setIsQRPaid(false); }}
                            className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-200 ${
                                paymentMethod === m.id 
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <m.icon size={20} className="mb-2"/>
                            <span className="text-xs font-bold">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* KONTEN DINAMIS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[250px] flex flex-col justify-center">
                
                {/* 1. TUNAI */}
                {paymentMethod === 'CASH' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Uang Diterima (Rp)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={cashReceived} 
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="w-full p-4 pl-4 bg-slate-50 border border-slate-300 rounded-xl text-2xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-300" 
                                placeholder="0" 
                            />
                        </div>
                        
                        <div className={`mt-6 p-4 rounded-xl flex justify-between items-center border ${
                            kembalian < 0 
                            ? 'bg-rose-50 border-rose-100 text-rose-700' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                            <span className="text-sm font-medium opacity-80">{kembalian < 0 ? 'Kekurangan' : 'Kembalian'}</span>
                            <span className="text-xl font-bold font-mono">Rp {Math.abs(kembalian).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* 2. QRIS */}
                {paymentMethod === 'QRIS' && (
                    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {totalAmount > 0 ? (
                            <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-lg mb-6">
                                <QRCode value={`POS:${Date.now()}:${totalAmount}`} size={160} />
                            </div>
                        ) : (
                            <div className="h-40 w-40 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-400">
                                <QrCode size={48} />
                            </div>
                        )}
                        
                        <div className="w-full">
                            {!isQRPaid ? (
                                <button onClick={() => setIsQRPaid(true)} className="w-full py-3 bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-200 transition">
                                    Simulasi: Cek Status
                                </button>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-4 rounded-xl border border-emerald-200 animate-in zoom-in duration-300">
                                    <CheckCircle size={32} /> 
                                    <span>Pembayaran Sukses</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. TRANSFER */}
                {paymentMethod === 'TRANSFER' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-5 border border-blue-100 flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                                <CreditCard size={24}/>
                            </div>
                            <div>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Bank BCA</p>
                                <p className="font-mono text-lg font-bold text-slate-800 tracking-wide">123-456-7890</p>
                                <p className="text-xs text-slate-500">a.n. Toko Kita</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                            />
                            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                                transferFile ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                            }`}>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <div className={`p-3 rounded-full ${transferFile ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Upload size={20}/>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">
                                        {transferFile ? transferFile.name : "Klik untuk upload bukti"}
                                    </span>
                                    {!transferFile && <span className="text-xs text-slate-400">JPG, PNG allowed</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Tombol Bayar */}
        <div className="p-6 bg-white border-t border-slate-200 z-20">
            <button 
                onClick={handleCheckout} 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
            >
                PROSES BAYAR
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono opacity-80">ENTER</span>
            </button>
        </div>
      </div>
    </div>
  );
}