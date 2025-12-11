"use client";
import { useState, useEffect } from "react";
import { Plus, Trash, Package, Barcode, Tag, Archive, X, AlertCircle, Printer } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", barcode: "", price: 0, costPrice: 0, stock: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (data.products) setProducts(data.products);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ name: "", barcode: "", price: 0, costPrice: 0, stock: 0 });
      fetchProducts();
    } else {
      const err = await res.json();
      alert(err.message);
    }
  };

  // Fungsi Baru: Cetak Label
  const handlePrintLabel = (id: string) => {
    window.open(`/dashboard/products/print-label/${id}`, '_blank', 'width=400,height=400');
  };

  // Fungsi Hapus (Placeholder logic)
  const handleDelete = async (id: string) => {
      if(!confirm("Hapus produk ini?")) return;
      // Tambahkan logic fetch delete ke API disini jika sudah ada endpointnya
      alert("Fitur hapus belum dihubungkan ke API (bisa ditambahkan nanti)");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Package size={20} />
                <span className="font-bold text-sm tracking-wide uppercase">Inventory</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen Produk</h1>
            <p className="text-slate-500 mt-1">Kelola stok, harga, dan data barang toko Anda.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 
                      hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 font-medium"
        >
          <Plus size={20} /> Tambah Produk
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                <th className="p-5 pl-6">Barcode</th>
                <th className="p-5">Nama Produk</th>
                <th className="p-5 text-center">Stok</th>
                <th className="p-5 text-right">Modal</th>
                <th className="p-5 text-right">Harga Jual</th>
                <th className="p-5 text-center">Aksi</th>
                </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                            <Archive size={48} className="mb-4 opacity-20"/>
                            <p className="text-lg font-medium text-slate-600">Belum ada produk</p>
                            <p className="text-sm opacity-70">Tambahkan produk baru untuk memulai.</p>
                        </div>
                    </td>
                </tr>
                ) : (
                products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-5 pl-6 font-mono text-sm text-slate-500 bg-slate-50/50 group-hover:bg-slate-100/50 rounded-r-lg w-1 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <Barcode size={16} className="opacity-40"/>
                                {p.barcode}
                            </div>
                        </td>
                        <td className="p-5 font-semibold text-slate-700">{p.name}</td>

                        <td className="p-5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                p.stock < 5 
                                ? "bg-rose-50 text-rose-600 border-rose-100" 
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}>
                                {p.stock < 5 && <AlertCircle size={12} className="mr-1"/>}
                                {p.stock} Unit
                            </span>
                        </td>

                        <td className="p-5 text-right font-mono text-slate-500 text-sm">
                            Rp {p.costPrice.toLocaleString()}
                        </td>

                        <td className="p-5 text-right font-mono font-bold text-indigo-600">
                            Rp {p.price.toLocaleString()}
                        </td>

                        <td className="p-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                                {/* Tombol CETAK LABEL (Baru) */}
                                <button 
                                    onClick={() => handlePrintLabel(p.id)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" 
                                    title="Cetak Label Barcode"
                                >
                                    <Printer size={18} />
                                </button>
                                
                                {/* Tombol HAPUS */}
                                <button 
                                    onClick={() => handleDelete(p.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all" 
                                    title="Hapus Produk"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
        
        {products.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-100 p-4 text-xs text-slate-500 flex justify-between items-center">
                <span>Menampilkan <strong>{products.length}</strong> produk</span>
            </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <Plus className="bg-indigo-100 text-indigo-600 p-1 rounded-md" size={24}/> Tambah Produk
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                    <X size={20}/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Barcode */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Barcode / Kode</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><Barcode size={18}/></span>
                    <input
                    /* UPDATE: Tidak required, agar bisa Auto-Generate */
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                    placeholder="Scan / Kosongkan untuk Auto-Generate"
                    />
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Produk</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><Tag size={18}/></span>
                    <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Nama barang..."
                    />
                </div>
              </div>

              {/* Stok */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stok Awal</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400"><Archive size={18}/></span>
                    <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
              </div>

              {/* Harga Group */}
              <div className="grid grid-cols-2 gap-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Harga Modal (Beli)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">Rp</span>
                    <input
                        required
                        type="number"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-emerald-600 text-xs font-bold">Rp</span>
                    <input
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full pl-9 pr-3 py-2 border border-emerald-300 ring-1 ring-emerald-100 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
                >
                  Simpan Produk
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}