"use client";
import { useState, useRef, useEffect } from "react";
import {
  Trash, Search, LogOut, Upload, CheckCircle,
  CreditCard, Banknote, QrCode, Clock
} from "lucide-react";
import { signOut } from "next-auth/react";
import QRCode from "react-qr-code";

export default function PosPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // PEMBAYARAN
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState("");

  // INFO ORDER (TIDAK DIHAPUS)
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState("TOKO");

  // TAMBAHAN LAMA (TIDAK DIHAPUS)
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const kembalian = (Number(cashReceived) || 0) - totalAmount;

  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  // ================= LOGIC LAMA =================
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
      const exist = prev.find(i => i.id === product.id);
      if (exist) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (paymentMethod === "TRANSFER" && !transferFile)
      return alert("Upload bukti transfer!");
    if (paymentMethod === "QRIS" && !isQRPaid)
      return alert("QRIS belum dikonfirmasi!");

    if (!confirm("Proses transaksi ini?")) return;

    let proofUrl = null;
    if (paymentMethod === "TRANSFER" && transferFile) {
      const form = new FormData();
      form.append("file", transferFile);
      const upload = await fetch("/api/upload", {
        method: "POST",
        body: form
      });
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
      setCart([]);
      setCashReceived("");
      setCustomerName("");
      setPlatform("TOKO");
      setTransferFile(null);
      setIsQRPaid(false);
      setPaymentMethod("CASH");

      if (confirm("Transaksi Berhasil! Cetak Struk?")) {
        window.open(
          `/pos/print/${result.data.id}`,
          "_blank",
          "width=400,height=600"
        );
      }
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">

      {/* ================= LEFT ================= */}
      <div className="w-2/3 flex flex-col bg-white border-r">
        <div className="p-5 border-b flex justify-between items-center">
          <h1 className="font-bold text-2xl text-indigo-700">
            KASIR TOKO
          </h1>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-slate-500 hover:text-rose-600"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>

        <div className="p-5 bg-slate-50 border-b">
          <form onSubmit={handleScan} className="relative">
            <Search
              className="absolute left-4 top-3.5 text-slate-400"
              size={20}
            />
            <input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan Barcode / Ketik Kode Barang..."
              className="w-full pl-12 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </form>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-1/3 bg-slate-50 flex flex-col border-l">

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* INFO ORDER (TETAP ADA) */}
          <div className="bg-white p-5 rounded-2xl border space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase">
              Informasi Order
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500">
                Nama Pelanggan
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border p-2.5 rounded-lg text-sm"
                placeholder="Nama (Opsional)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">
                Sumber Order
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border p-2.5 rounded-lg text-sm font-bold text-indigo-600"
              >
                <option value="TOKO">Toko (Offline)</option>
                <option value="TIKTOK">TikTok Shop</option>
              </select>
            </div>
          </div>

          {/* METODE BAYAR + DP */}
          <div className="bg-white p-5 rounded-2xl border">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">
              Metode Bayar
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "CASH", label: "Tunai", icon: <Banknote size={20} /> },
                { id: "QRIS", label: "QRIS", icon: <QrCode size={20} /> },
                { id: "TRANSFER", label: "Transfer", icon: <CreditCard size={20} /> },
                { id: "DP", label: "DP/Termin", icon: <Clock size={20} /> }
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setPaymentMethod(b.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1
                    ${paymentMethod === b.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {b.icon}
                  <span className="text-[10px] font-bold">{b.label}</span>
                </button>
              ))}
            </div>

            {/* INPUT BAYAR */}
            <div className="mt-4 pt-4 border-t">
              {(paymentMethod === "CASH" || paymentMethod === "DP") && (
                <>
                  <label className="text-xs font-bold text-slate-500">
                    {paymentMethod === "DP"
                      ? "Nominal DP Masuk"
                      : "Uang Diterima"}
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full pl-10 py-2.5 border rounded-lg text-lg font-mono font-bold"
                    />
                  </div>

                  {paymentMethod === "DP" && Number(cashReceived) > 0 && (
                    <div className="mt-2 p-3 bg-orange-100 text-orange-800 text-center rounded-lg font-bold">
                      Sisa Hutang: Rp{" "}
                      {(totalAmount - Number(cashReceived)).toLocaleString()}
                    </div>
                  )}

                  {paymentMethod === "CASH" && Number(cashReceived) > 0 && (
                    <div className={`mt-2 p-3 text-center rounded-lg font-bold
                      ${kembalian >= 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"}`}>
                      {kembalian >= 0
                        ? `Kembalian: Rp ${kembalian.toLocaleString()}`
                        : `Kurang: Rp ${Math.abs(kembalian).toLocaleString()}`}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white p-6 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-slate-500">Total Tagihan</span>
            <span className="text-3xl font-black text-indigo-700 font-mono">
              Rp {totalAmount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold"
          >
            PROSES PEMBAYARAN
          </button>
        </div>

      </div>
    </div>
  );
}
