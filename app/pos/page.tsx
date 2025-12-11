"use client";

import { useState, useRef, useEffect } from "react";
import { Trash, Search, LogOut, Upload, CheckCircle } from "lucide-react";
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
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (error) {
      alert("Error sistem saat transaksi");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* BAGIAN KIRI: List Produk & Scan */}
      <div className="w-2/3 flex flex-col border-r border-gray-300">
        <div className="bg-white p-4 shadow-sm flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-800">POS Kasir</h1>
            <div className="space-x-2">
                <button onClick={() => router.push('/dashboard/products')} className="text-sm bg-gray-200 px-3 py-1 rounded">Dashboard</button>
                <button onClick={() => signOut({callbackUrl:'/'})} className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded flex items-center gap-1">
                    <LogOut size={14}/> Logout
                </button>
            </div>
        </div>

        <div className="p-4 bg-white border-b">
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative w-full">
                <span className="absolute left-3 top-2.5 text-gray-400"><Search size={20}/></span>
                <input
                    ref={inputRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan Barcode / Ketik Kode Barang lalu Enter..."
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    autoFocus
                />
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
            <table className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 border-b">
                    <tr>
                        <th className="p-3 text-left">Nama Produk</th>
                        <th className="p-3 text-left">Harga</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3">Rp {item.price.toLocaleString()}</td>
                            <td className="p-3 text-center"><span className="bg-gray-200 px-2 py-1 rounded font-bold">{item.quantity}</span></td>
                            <td className="p-3 text-right font-bold">Rp {(item.price * item.quantity).toLocaleString()}</td>
                            <td className="p-3 text-center">
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><Trash size={18}/></button>
                            </td>
                        </tr>
                    ))}
                    {cart.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-400">Keranjang kosong.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>

      {/* BAGIAN KANAN: Pembayaran */}
      <div className="w-1/3 bg-white flex flex-col shadow-xl z-10">
        <div className="flex-1 p-6 flex flex-col justify-start bg-gray-50 overflow-y-auto">
            <div className="text-center mb-6">
                <h2 className="text-gray-500 text-sm">Total Tagihan</h2>
                <div className="text-4xl font-extrabold text-blue-600">Rp {totalAmount.toLocaleString()}</div>
            </div>

            {/* Pilihan Metode */}
            <label className="block text-sm font-bold text-gray-700 mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
                {['CASH', 'QRIS', 'TRANSFER'].map((m) => (
                    <button key={m} onClick={() => { setPaymentMethod(m); setIsQRPaid(false); }}
                        className={`py-3 text-sm font-bold border rounded transition ${
                            paymentMethod === m 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}>
                        {m}
                    </button>
                ))}
            </div>

            {/* KONTEN DINAMIS (TUNAI / QRIS / TRANSFER) */}
            <div className="bg-white p-4 rounded shadow-sm border min-h-[200px]">
                
                {/* 1. TUNAI */}
                {paymentMethod === 'CASH' && (
                    <div>
                        <label className="block text-sm font-bold mb-2">Uang Diterima</label>
                        <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)}
                            className="w-full p-3 border rounded text-xl font-bold text-right" placeholder="0" />
                        <div className={`mt-4 text-right font-bold ${kembalian < 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {kembalian < 0 ? 'Kurang' : 'Kembali'}: Rp {Math.abs(kembalian).toLocaleString()}
                        </div>
                    </div>
                )}

                {/* 2. QRIS - Barcode muncul DISINI */}
                {paymentMethod === 'QRIS' && (
                    <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-gray-500 mb-4">Scan QR Code di bawah ini:</p>
                        
                        {totalAmount > 0 ? (
                            <div className="bg-white p-3 border rounded shadow-sm inline-block mb-4">
                                <QRCode value={`POS:${Date.now()}:${totalAmount}`} size={140} />
                            </div>
                        ) : <p className="text-red-500 text-xs">Masukkan barang dulu</p>}
                        
                        <div className="w-full">
                            {!isQRPaid ? (
                                <button onClick={() => setIsQRPaid(true)} className="w-full bg-yellow-500 text-white py-2 rounded text-sm hover:bg-yellow-600 font-bold">
                                    Simulasi: Cek Status Pembayaran
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 p-2 rounded border border-green-200">
                                    <CheckCircle size={20} /> Pembayaran Diterima
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. TRANSFER */}
                {paymentMethod === 'TRANSFER' && (
                    <div>
                        <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800 border border-blue-100">
                            <p className="font-bold">Bank BCA</p>
                            <p className="font-mono">123-456-7890</p>
                            <p>a.n. Toko Kita</p>
                        </div>
                        <label className="block text-sm font-bold mb-2">Upload Bukti Transfer</label>
                        <div className="border-2 border-dashed border-gray-300 p-6 rounded text-center cursor-pointer hover:bg-gray-50 relative group">
                            <input type="file" accept="image/*" 
                                onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className="flex flex-col items-center text-gray-500 group-hover:text-blue-500">
                                <Upload size={24} className="mb-2"/>
                                <span className="text-xs font-medium truncate w-full px-2">
                                    {transferFile ? transferFile.name : "Klik untuk pilih gambar"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Tombol Bayar */}
        <div className="p-4 border-t bg-white">
            <button onClick={handleCheckout} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition transform active:scale-95">
                PROSES BAYAR (ENTER)
            </button>
        </div>
      </div>
    </div>
  );
}