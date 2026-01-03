"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PrintPage() {
  const { id } = useParams(); 
  const [trx, setTrx] = useState<any>(null);

  useEffect(() => {
    if(!id) return;

    fetch(`/api/transactions/${id}`)
      .then((res) => {
          if (!res.ok) throw new Error("Gagal ambil data");
          return res.json();
      })
      .then((data) => {
        setTrx(data);
        setTimeout(() => {
          window.print();
        }, 800);
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!trx) return <div className="p-10 text-center font-mono">Memuat Struk... (ID: {id})</div>;

  // Cek apakah ini transaksi Hutang / DP
  const isDebt = trx.paymentMethod === 'DP' || (trx.debtAmount && trx.debtAmount > 0);

  return (
    <div className="p-4 font-mono text-sm max-w-[80mm] mx-auto bg-white text-black leading-tight">
      
      {/* HEADER */}
      <div className="text-center mb-4 border-b border-black border-dashed pb-2">
        <h2 className="text-xl font-bold uppercase">Butik  HIjab Malaeka</h2>
        <p className="text-xs">Kp. Daya Mekar RT.02 RW.09 Desa. Karanganyar Kec. Labuan, Pandeglang</p>
      </div>

      {/* INFO */}
      <div className="mb-2 text-xs">
        <div className="flex justify-between"><span>No:</span><span>{trx.invoiceNo}</span></div>
        <div className="flex justify-between"><span>Tgl:</span><span>{new Date(trx.createdAt).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Ksr:</span><span>{trx.platform} / {trx.customerName || "Guest"}</span></div>
      </div>

      {/* ITEMS */}
      <div className="border-b border-black border-dashed pb-2 mb-2">
        {trx.items.map((item: any) => (
          <div key={item.id} className="mb-1">
            <div className="font-bold truncate">{item.product.name}</div>
            <div className="flex justify-between text-xs">
              <span>{item.quantity} x {item.priceAtTime.toLocaleString()}</span>
              <span>{(item.quantity * item.priceAtTime).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* === LOGIKA TOTAL & PEMBAYARAN (BAGIAN PENTING) === */}
      <div className="border-b border-black border-dashed pb-2 mb-2">
        
        {/* JIKA HUTANG / DP */}
        {isDebt ? (
            <>
                <div className="flex justify-between">
                    <span>Total Tagihan:</span>
                    <span>Rp {trx.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>DP / Masuk:</span>
                    <span>Rp {(trx.cashReceived || 0).toLocaleString()}</span>
                </div>
                {/* Highlight Sisa Hutang */}
                <div className="flex justify-between font-bold text-lg mt-1 border-t border-black border-dashed pt-1">
                    <span>KURANG:</span>
                    <span>Rp {trx.debtAmount.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-center mt-1 italic">
                    (Status: BELUM LUNAS)
                </div>
            </>
        ) : (
            /* JIKA LUNAS (CASH, QRIS, TRANSFER) */
            <>
                <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span>Rp {trx.totalAmount.toLocaleString()}</span>
                </div>
                
                {/* Detail Bayar */}
                <div className="mt-1 text-xs">
                    {trx.paymentMethod === 'CASH' ? (
                        <>
                            <div className="flex justify-between"><span>Tunai:</span><span>Rp {(trx.cashReceived || 0).toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Kembali:</span><span>Rp {(trx.changeAmount || 0).toLocaleString()}</span></div>
                        </>
                    ) : (
                        <div className="flex justify-between uppercase font-bold">
                            <span>{trx.paymentMethod}:</span>
                            <span>LUNAS</span>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      <div className="text-center mt-4 text-xs">
        <p>-- Terima Kasih --</p>
        <p className="text-[10px]">Barang yang dibeli tidak dapat ditukar/dikembalikan</p>
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