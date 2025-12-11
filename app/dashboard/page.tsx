"use client";
import { useState, useEffect } from "react";
import { Plus, Trash } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "", barcode: "", price: 0, costPrice: 0, stock: 0
  });

  // Fetch Produk saat load
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
      fetchProducts(); // Refresh data
    } else {
      const err = await res.json();
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Tambah Produk
        </button>
      </div>

      {/* TABEL PRODUK */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Barcode</th>
              <th className="p-4">Nama Produk</th>
              <th className="p-4">Stok</th>
              <th className="p-4">Modal</th>
              <th className="p-4">Harga Jual</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Belum ada data produk.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{p.barcode}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className={`p-4 ${p.stock < 5 ? 'text-red-500 font-bold' : ''}`}>{p.stock}</td>
                  <td className="p-4">Rp {p.costPrice.toLocaleString()}</td>
                  <td className="p-4 text-green-600 font-bold">Rp {p.price.toLocaleString()}</td>
                  <td className="p-4">
                    <button className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH PRODUK */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Produk Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Barcode</label>
                <input required type="text" className="w-full border p-2 rounded" 
                  value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Nama Produk</label>
                <input required type="text" className="w-full border p-2 rounded" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Stok Awal</label>
                  <input required type="number" className="w-full border p-2 rounded" 
                    value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                <div>
                   {/* Spacer atau kategori nanti */}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Harga Beli (Modal)</label>
                  <input required type="number" className="w-full border p-2 rounded" 
                    value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Harga Jual</label>
                  <input required type="number" className="w-full border p-2 rounded" 
                    value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}