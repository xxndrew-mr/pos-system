"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash, Search, LogOut, Upload, CheckCircle,
  CreditCard, Banknote, QrCode
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function PosPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // STATE PEMBAYARAN
  // ===============================
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");

  // ===============================
  // STATE BARU (REVISI)
  // ===============================
  const [customerName, setCustomerName] = useState("");
  const [platform, setPlatform] = useState("TOKO");

  // ===============================
  // STATE TAMBAHAN
  // ===============================
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isQRPaid, setIsQRPaid] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ===============================
  // HITUNG TOTAL
  // ===============================
  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const kembalian = (Number(cashReceived) || 0) - totalAmount;

  useEffect(() => {
    inputRef.current?.focus();
  }, [cart]);

  // ===============================
  // SCAN BARCODE
  // ===============================
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
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // ===============================
  // CHECKOUT FINAL
  // ===============================
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");

    if (paymentMethod === "TRANSFER" && !transferFile) {
      return alert("Upload bukti transfer!");
    }

    if (paymentMethod === "QRIS" && !isQRPaid) {
      return alert("QRIS belum dikonfirmasi!");
    }

    if (!confirm("Proses transaksi ini?")) return;

    let proofUrl = null;

    if (paymentMethod === "TRANSFER" && transferFile) {
      const form = new FormData();
      form.append("file", transferFile);

      const upload = await fetch("/api/upload", {
        method: "POST",
        body: form,
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

      // ===============================
      // DATA BARU DIKIRIM KE API
      // ===============================
      customerName,
      platform,
    };

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (result.success) {
      alert("Transaksi berhasil!");
      setCart([]);
      setCashReceived("");
      setCustomerName("");
      setPlatform("TOKO");
      setTransferFile(null);
      setIsQRPaid(false);
      setPaymentMethod("CASH");

      if (confirm("Cetak struk?")) {
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ================= LEFT ================= */}
      <div className="w-2/3 bg-white border-r flex flex-col">
        <div className="p-6 border-b flex justify-between">
          <h1 className="font-bold text-xl">Kasir</h1>
          <button onClick={() => signOut()}>
            <LogOut size={18} />
          </button>
        </div>

        <form onSubmit={handleScan} className="p-6">
          <input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan Barcode..."
            className="w-full p-3 border rounded-xl text-lg"
          />
        </form>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full">
            <tbody>
              {cart.map((i) => (
                <tr key={i.id} className="border-b">
                  <td>{i.name}</td>
                  <td>{i.quantity}</td>
                  <td>Rp {(i.price * i.quantity).toLocaleString()}</td>
                  <td>
                    <button onClick={() => removeFromCart(i.id)}>
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-1/3 bg-white p-6 flex flex-col border-l">

        <h2 className="text-2xl font-bold mb-4">Checkout</h2>

        {/* NAMA CUSTOMER */}
        <div className="mb-4">
          <label className="text-sm font-bold">Nama Pelanggan</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Opsional"
          />
        </div>

        {/* PLATFORM */}
        <div className="mb-4">
          <label className="text-sm font-bold">Sumber Order</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full border p-2 rounded font-bold"
          >
            <option value="TOKO">🏪 Toko</option>
            <option value="TIKTOK">🎵 TikTok</option>
            <option value="SHOPEE">🧡 Shopee</option>
          </select>
        </div>

        <div className="mt-auto">
          <div className="text-xl font-bold mb-4">
            Total: Rp {totalAmount.toLocaleString()}
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold"
          >
            PROSES BAYAR
          </button>
        </div>
      </div>
    </div>
  );
}
