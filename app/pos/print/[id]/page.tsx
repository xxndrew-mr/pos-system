"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PrintPage() {
  const { id } = useParams(); // Mengambil ID dari URL
  const [trx, setTrx] = useState<any>(null);

  useEffect(() => {
    if(!id) return;

    // Fetch data transaksi berdasarkan ID
    fetch(`/api/transactions/${id}`)
      .then((res) => {
          if (!res.ok) throw new Error("Gagal ambil data");
          return res.json();
      })
      .then((data) => {
        setTrx(data);
        // Auto print setelah data muncul (delay dikit biar render beres)
        setTimeout(() => {
          window.print();
        }, 800);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!trx) return <div className="p-10 text-center font-mono">Memuat Struk... (ID: {id})</div>;

  return (
    <div className="p-4 font-mono text-sm max-w-[80mm] mx-auto bg-white text-black leading-tight">
      {/* HEADER */}
      <div className="text-center mb-4 border-b border-black border-dashed pb-2">
        <h2 className="text-xl font-bold">TOKO ANDRE</h2>
        <p className="text-xs">Jl. Sukses Selalu No. 1</p>
      </div>

      {/* INFO */}
      <div className="mb-2 text-xs">
        <div className="flex justify-between"><span>No:</span><span>{trx.invoiceNo}</span></div>
        <div className="flex justify-between"><span>Tgl:</span><span>{new Date(trx.createdAt).toLocaleString()}</span></div>
      </div>

      {/* ITEMS */}
      <div className="border-b border-black border-dashed pb-2 mb-2">
        {trx.items.map((item: any) => (
          <div key={item.id} className="mb-1">
            <div className="font-bold">{item.product.name}</div>
            <div className="flex justify-between text-xs">
              <span>{item.quantity} x {item.priceAtTime.toLocaleString()}</span>
              <span>{(item.quantity * item.priceAtTime).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="flex justify-between font-bold text-lg">
        <span>TOTAL:</span>
        <span>Rp {trx.totalAmount.toLocaleString()}</span>
      </div>

      {/* KEMBALIAN (Jika Tunai) */}
      {trx.paymentMethod === 'CASH' && (
        <div className="mt-1 text-xs border-t border-black border-dashed pt-1">
           <div className="flex justify-between"><span>Bayar:</span><span>Rp {trx.cashReceived?.toLocaleString()}</span></div>
           <div className="flex justify-between"><span>Kembali:</span><span>Rp {trx.changeAmount?.toLocaleString()}</span></div>
        </div>
      )}

      <div className="text-center mt-6 text-xs">
        <p>-- Terima Kasih --</p>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
}