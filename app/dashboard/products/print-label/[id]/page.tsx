"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Barcode from "react-barcode";

export default function PrintLabelPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // IDEAL: GET by ID → /api/products/[id]
    // SEMENTARA: ambil semua lalu filter
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const found = data.products.find((p: any) => p.id === id);
        setProduct(found);

        if (found) {
          setTimeout(() => window.print(), 500);
        }
      });
  }, [id]);

  if (!product) {
    return <div className="p-10">Memuat Label...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 print:bg-white">

      {/* ================== AREA CETAK ================== */}
      <div
        id="printable-label"
        className="bg-white p-2 border border-gray-300"
        style={{
          width: "50mm",
          height: "30mm",
        }}
      >
        <div className="flex flex-col items-center justify-center text-center h-full">

          {/* BRAND */}
          <h2 className="text-[9px] font-bold uppercase leading-none">
            TOKO ANDRE FASHION
          </h2>

          {/* NAMA PRODUK */}
          <p className="text-[9px] leading-tight mt-1 truncate w-full font-medium">
            {product.name}
          </p>

          {/* BARCODE */}
          <div className="mt-1">
            <Barcode
              value={product.barcode}
              width={1.2}
              height={26}
              fontSize={9}
              margin={0}
              displayValue
            />
          </div>

          {/* HARGA */}
          <p className="text-[10px] font-bold mt-1">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* ================== CSS PRINT GLOBAL ================== */}
      <style jsx global>{`
        #printable-label {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background-color: white !important;
        }

        @media print {
          @page {
            margin: 0;
            size: auto;
          }

          body {
            margin: 0;
            padding: 0;
          }

          /* SEMBUNYIKAN SEMUA */
          body * {
            visibility: hidden;
          }

          /* TAMPILKAN HANYA LABEL */
          #printable-label,
          #printable-label * {
            visibility: visible;
          }

          /* POSISI FIX DI KIRI ATAS */
          #printable-label {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
