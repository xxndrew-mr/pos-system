"use client";
import { useState } from "react";
import { Lock, Save } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(form.newPassword !== form.confirmPassword) {
        setMessage({ type: "error", text: "Konfirmasi password tidak cocok!" });
        return;
    }
    if(form.newPassword.length < 6) {
        setMessage({ type: "error", text: "Password minimal 6 karakter!" });
        return;
    }

    setLoading(true);
    // Kita pakai API ganti password yang sudah kita bahas sebelumnya
    // Pastikan file API app/api/users/change-password/route.ts SUDAH DIBUAT (Lihat chat sebelumnya)
    const res = await fetch("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ newPassword: form.newPassword }),
        headers: { "Content-Type": "application/json" }
    });

    if(res.ok) {
        setMessage({ type: "success", text: "Password berhasil diganti!" });
        setForm({ newPassword: "", confirmPassword: "" });
    } else {
        setMessage({ type: "error", text: "Gagal mengganti password." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock className="text-indigo-600" size={20}/> Ganti Password
        </h2>

        {message.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Password Baru</label>
                <input 
                    type="password" 
                    required
                    className="w-full border p-2.5 rounded-lg"
                    value={form.newPassword}
                    onChange={e=>setForm({...form, newPassword: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Konfirmasi Password Baru</label>
                <input 
                    type="password" 
                    required
                    className="w-full border p-2.5 rounded-lg"
                    value={form.confirmPassword}
                    onChange={e=>setForm({...form, confirmPassword: e.target.value})}
                />
            </div>

            <button disabled={loading} className="bg-indigo-600 text-white w-full py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2">
                <Save size={18}/> {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
        </form>
      </div>
    </div>
  );
}