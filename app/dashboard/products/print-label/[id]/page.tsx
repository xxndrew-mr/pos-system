"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Barcode from "react-barcode"; // Import library barcode

export default function PrintLabelPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Cari produk by ID (bukan barcode, karena kita ambil detailnya)
    // Note: Kita butuh endpoint get-by-id atau filter manual dari list
    // Agar cepat, kita pakai logic fetch list lalu find (atau Anda bisa buat API get by id khusus)
    
    // Cara cepat: Ambil semua lalu filter (Idealnya buat API GET /api/products/[id])
    fetch("/api/products") 
      .then(res => res.json())
      .then(data => {
        const found = data.products.find((p: any) => p.id === id);
        setProduct(found);
        
        if(found) {
            setTimeout(() => window.print(), 500);
        }
      });
  }, [id]);

  if (!product) return <div className="p-10">Memuat Label...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 print:bg-white print:min-h-0">
      
      {/* Container Label (Preview di layar) */}
      <div className="bg-white p-2 border border-gray-300 rounded print:border-0 print:p-0">
        
        {/* AREA CETAK LABEL (Sesuaikan ukuran sticker) */}
        <div className="w-[50mm] h-[30mm] flex flex-col items-center justify-center text-center border border-dashed border-gray-200 print:border-0">
            
            {/* Nama Toko / Brand */}
            <h2 className="text-[10px] font-bold uppercase mb-1">TOKO ANDRE FASHION</h2>
            
            {/* Nama Produk (Truncate kalau kepanjangan) */}
            <p className="text-[10px] leading-tight px-1 truncate w-full font-medium">
                {product.name}
            </p>

            {/* BARCODE GENERATOR */}
            <div className="max-w-full overflow-hidden">
                <Barcode 
                    value={product.barcode} 
                    width={1.2} // Ketebalan garis (sesuaikan biar muat)
                    height={30} // Tinggi garis
                    fontSize={10} // Ukuran font angka di bawah garis
                    margin={2}
                    displayValue={true} // Tampilkan angka di bawah garis
                />
            </div>

            {/* Harga */}
            <p className="text-xs font-bold mt-1">
                Rp {product.price.toLocaleString()}
            </p>
        </div>

      </div>

      {/* CSS KHUSUS PRINT */}
      <style jsx global>{`
        @media print {
          @page { 
            size: auto; 
            margin: 0mm; 
          }
          body { 
            margin: 0; 
            padding: 0; 
          }
          /* Sembunyikan elemen browser lain */
          body * {
            visibility: hidden;
          }
          /* Hanya tampilkan area label */
          .w-\\[50mm\\], .w-\\[50mm\\] * {
            visibility: visible;
          }
          .w-\\[50mm\\] {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}