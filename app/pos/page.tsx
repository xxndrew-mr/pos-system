"use client";
import { useState, useRef, useEffect } from "react";
import { Trash, Search, LogOut, Upload, CheckCircle, CreditCard, Banknote, QrCode, Clock, User, Box } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import QRCode from "react-qr-code";

// [FIX 1] WAJIB ADA: Mencegah error "Prerender Error" saat deploy Vercel
export const dynamic = "force-dynamic";

export default function PosPage() {
  // [FIX 2] Cara panggil session yang aman (Anti Crash saat Build)
  const sessionObj = useSession();
  const session = sessionObj?.data; 

  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // STATE PEMBAYARAN
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // CASH, QRIS, TRANSFER, DP
  const [cashReceived, setCashReceived] = useState<string>("");

  // STATE INPUT DATA
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState("TOKO");

  // STATE TAMBAHAN
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // HITUNG TOTAL
  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Logic Kembalian / Sisa Hutang
  const bayar = Number(cashReceived) || 0;
  const kembalian = bayar - totalAmount;
  const sisaHutang = totalAmount - bayar;

  // Auto Focus Barcode Input saat Cart berubah
  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  // --- LOGIC SCAN BARANG ---
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
        alert("Gagal mengambil data produk");
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

  // --- LOGIC CHECKOUT ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (paymentMethod === "TRANSFER" && !transferFile) return alert("Wajib upload bukti transfer!");
    if (paymentMethod === "QRIS" && !isQRPaid) return alert("Konfirmasi pembayaran QRIS dulu!");

    // Validasi DP
    if (paymentMethod === "DP" && bayar <= 0) return alert("Nominal DP tidak boleh kosong!");

    if (!confirm("Proses transaksi ini?")) return;

    let proofUrl = null;
    if (paymentMethod === "TRANSFER" && transferFile) {
        // Simulasi Upload (Idealnya upload ke Cloudinary/S3)
        // Disini kita anggap string dummy dulu kalau belum ada API upload image
        proofUrl = "bukti_transfer_dummy.jpg"; 
    }

    const payload = {
        items: cart,
        totalAmount,
        paymentMethod, // String: "CASH", "QRIS", "DP", "TRANSFER"
        cashReceived: bayar,
        paymentProof: proofUrl,
        customerName: customerName || "Guest",
        platform: platform
    };

    try {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.success) {
            // RESET SEMUA STATE
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
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">

      {/* ================= BAGIAN KIRI (CART & SCANNER) ================= */}
      <div className="w-full lg:w-2/3 flex flex-col border-r border-slate-200 bg-white">
        
        {/* Header Kasir */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shadow-sm z-10">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Box size={24}/>
                </div>
                <div>
                    <h1 className="font-bold text-xl text-slate-800 leading-tight">KASIR TOKO</h1>
                    <p className="text-xs text-slate-400">Kasir: {session?.user?.name || "Admin"}</p>
                </div>
            </div>
            <button onClick={() => signOut()} className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-lg transition font-medium text-sm">
                <LogOut size={16} /> Keluar
            </button>
        </div>

        {/* Input Barcode Scanner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
            <form onSubmit={handleScan} className="relative group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition" size={20}/>
                <input
                    ref={inputRef}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan Barcode / Ketik Kode Barang Disini..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg shadow-sm font-mono"
                    autoFocus
                    disabled={loading}
                />
            </form>
        </div>

        {/* Tabel Keranjang Belanja */}
        <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <div className="bg-white p-6 rounded-full shadow-sm"><Box size={48} className="opacity-20"/></div>
                    <p>Keranjang masih kosong.</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 text-slate-500 text-xs font-bold uppercase tracking-wider shadow-sm z-10">
                        <tr>
                            <th className="p-4 border-b">Produk</th>
                            <th className="p-4 border-b text-center">Qty</th>
                            <th className="p-4 border-b text-right">Harga</th>
                            <th className="p-4 border-b text-right">Subtotal</th>
                            <th className="p-4 border-b text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {cart.map((item) => (
                            <tr key={item.id} className="hover:bg-indigo-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-slate-700">{item.name}</div>
                                    <div className="text-xs text-slate-400 font-mono">{item.barcode}</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold text-sm border">{item.quantity}</span>
                                </td>
                                <td className="p-4 text-right text-slate-500 text-sm">
                                    Rp {item.price.toLocaleString()}
                                </td>
                                <td className="p-4 text-right font-bold text-indigo-700">
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-full transition">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {/* ================= BAGIAN KANAN (CHECKOUT & PAYMENT) ================= */}
      <div className="w-full lg:w-1/3 bg-white flex flex-col h-full border-l border-slate-200 shadow-xl z-20">
        
        {/* Area Scrollable untuk Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. INFO PELANGGAN */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-indigo-600"/>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Pelanggan</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full border border-slate-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Nama Pelanggan (Opsional)"
                        />
                    </div>
                    <div className="col-span-2">
                        <select 
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            className="w-full border border-slate-300 p-2 rounded-lg text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="TOKO">🏪 Toko (Offline)</option>
                            <option value="TIKTOK">🎵 TikTok Shop</option>
                            <option value="SHOPEE">🧡 Shopee</option>
                            <option value="TOKOPEDIA">💚 Tokopedia</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. PILIH METODE BAYAR */}
            <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Metode Pembayaran</h3>
                <div className="grid grid-cols-4 gap-2">
                    {['CASH', 'QRIS', 'TRANSFER', 'DP'].map((method) => (
                        <button 
                            key={method}
                            onClick={() => setPaymentMethod(method)} 
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all h-20 ${paymentMethod === method ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                        >
                            {method === 'CASH' && <Banknote size={20}/>}
                            {method === 'QRIS' && <QrCode size={20}/>}
                            {method === 'TRANSFER' && <CreditCard size={20}/>}
                            {method === 'DP' && <Clock size={20}/>}
                            <span className="text-[10px] font-bold">{method}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. DETAIL PEMBAYARAN (DYNAMIC) */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                
                {/* --- JIKA CASH ATAU DP --- */}
                {(paymentMethod === 'CASH' || paymentMethod === 'DP') && (
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500">
                            {paymentMethod === 'DP' ? 'Nominal DP Masuk' : 'Uang Diterima (Tunai)'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-400 text-sm font-bold">Rp</span>
                            <input 
                                type="number" 
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-xl font-mono font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                placeholder="0"
                            />
                        </div>

                        {/* Info Kembalian / Hutang */}
                        {bayar > 0 && (
                            <div className={`p-3 rounded-lg text-center font-bold text-sm ${paymentMethod === 'DP' ? 'bg-orange-100 text-orange-700' : (kembalian >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}`}>
                                {paymentMethod === 'DP' 
                                    ? `Sisa Hutang: Rp ${sisaHutang.toLocaleString()}`
                                    : (kembalian >= 0 ? `Kembalian: Rp ${kembalian.toLocaleString()}` : `Kurang: Rp ${Math.abs(kembalian).toLocaleString()}`)
                                }
                            </div>
                        )}
                    </div>
                )}

                {/* --- JIKA QRIS --- */}
                {paymentMethod === 'QRIS' && (
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            {/* QR CODE GENERATOR */}
                            <QRCode 
                                value={`PAY-${totalAmount}-${Date.now()}`} 
                                size={150} 
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        <div className="text-xs text-slate-500">
                            <p className="font-bold">Scan QRIS</p>
                            <p>Total: Rp {totalAmount.toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => setIsQRPaid(!isQRPaid)}
                            className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${isQRPaid ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            {isQRPaid ? <><CheckCircle size={16}/> Pembayaran Diterima</> : "Konfirmasi Pembayaran Masuk"}
                        </button>
                    </div>
                )}

                {/* --- JIKA TRANSFER --- */}
                {paymentMethod === 'TRANSFER' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 font-bold mb-1">Silakan Transfer ke:</p>
                            <p className="font-mono font-bold text-slate-800 text-lg">BCA: 123-456-7890</p>
                            <p className="text-xs text-slate-500">a.n Maelika Butik Official</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Upload Bukti Transfer</label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer bg-white">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {transferFile ? (
                                    <div className="text-emerald-600 font-bold text-sm flex flex-col items-center">
                                        <CheckCircle size={24} className="mb-1"/>
                                        <span className="truncate w-full px-4">{transferFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 text-sm flex flex-col items-center">
                                        <Upload size={24} className="mb-1"/>
                                        <span>Klik untuk Upload</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* FOOTER TOTAL & TOMBOL BAYAR */}
        <div className="bg-white p-5 border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
            <div className="flex justify-between items-end mb-4">
                <span className="text-slate-500 font-bold text-sm uppercase">Total Tagihan</span>
                <span className="text-3xl font-black text-indigo-700 font-mono tracking-tight">
                    Rp {totalAmount.toLocaleString()}
                </span>
            </div>
            <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Memproses..." : "PROSES PEMBAYARAN"}
            </button>
        </div>

      </div>
    </div>
  );
}