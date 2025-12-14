"use client";
import { useState, useRef, useEffect } from "react";
import {
  Trash, Search, LogOut, Upload, CheckCircle,
  CreditCard, Banknote, QrCode, Clock
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function PosPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // PEMBAYARAN
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");

  // INFO ORDER
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState("TOKO");

  // TAMBAHAN
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );
  const kembalian = (Number(cashReceived) || 0) - totalAmount;

  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

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
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
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
      setCart([]);
      setCashReceived("");
      setCustomerName("");
      setPlatform("TOKO");
      setTransferFile(null);
      setIsQRPaid(false);
      setPaymentMethod("CASH");

      if (confirm("Transaksi Berhasil! Cetak Struk?")) {
        window.open(`/pos/print/${result.data.id}`, "_blank", "width=400,height=600");
      }
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">

      {/* ================= LEFT ================= */}
      <div className="w-2/3 flex flex-col border-r bg-white">
        <div className="p-5 border-b flex justify-between">
          <h1 className="font-bold text-2xl text-indigo-700">KASIR TOKO</h1>
          <button onClick={() => signOut()} className="flex items-center gap-2 text-slate-500 hover:text-rose-600">
            <LogOut size={18} /> Keluar
          </button>
        </div>

        <div className="p-5 bg-slate-50 border-b">
          <form onSubmit={handleScan} className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full pl-12 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 font-mono"
              placeholder="Scan Barcode / Ketik Kode Barang..."
            />
          </form>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-1/3 bg-slate-50 flex flex-col border-l">

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* METODE BAYAR */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Metode Bayar</h3>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "CASH", icon: <Banknote size={20} />, label: "Tunai" },
                { id: "QRIS", icon: <QrCode size={20} />, label: "QRIS" },
                { id: "TRANSFER", icon: <CreditCard size={20} />, label: "Transfer" },
                { id: "DP", icon: <Clock size={20} />, label: "DP/Termin" }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setPaymentMethod(btn.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1
                    ${paymentMethod === btn.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                      : "bg-white border-slate-200 text-slate-600"}`}
                >
                  {btn.icon}
                  <span className="text-[10px] font-bold">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* INPUT BAYAR */}
            <div className="mt-4 pt-4 border-t">
              {(paymentMethod === "CASH" || paymentMethod === "DP") && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {paymentMethod === "DP" ? "Nominal DP Masuk" : "Uang Diterima"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full pl-10 py-2.5 border rounded-lg text-lg font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {paymentMethod === "DP" && Number(cashReceived) > 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-orange-100 text-orange-800 text-center font-bold">
                      Sisa Hutang: Rp {(totalAmount - Number(cashReceived)).toLocaleString()}
                    </div>
                  )}

                  {paymentMethod === "CASH" && Number(cashReceived) > 0 && (
                    <div className={`mt-2 p-3 rounded-lg text-center font-bold
                      ${kembalian >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {kembalian >= 0
                        ? `Kembalian: Rp ${kembalian.toLocaleString()}`
                        : `Kurang: Rp ${Math.abs(kembalian).toLocaleString()}`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="bg-white p-6 border-t">
          <div className="flex justify-between mb-4">
            <span className="font-bold text-slate-500">Total</span>
            <span className="text-3xl font-black text-indigo-700 font-mono">
              Rp {totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700"
          >
            PROSES PEMBAYARAN
          </button>
        </div>

      </div>
    </div>
  );
}
