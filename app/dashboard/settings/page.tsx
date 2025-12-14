"use client";
import { useState } from "react";
import { Lock, Save, Eye, EyeOff, KeyRound, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // State untuk Show/Hide Password
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" }); // Reset message

    if(form.newPassword !== form.confirmPassword) {
        setMessage({ type: "error", text: "Konfirmasi password tidak cocok!" });
        return;
    }
    if(form.newPassword.length < 6) {
        setMessage({ type: "error", text: "Password minimal 6 karakter!" });
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/users/change-password", {
            method: "POST",
            body: JSON.stringify({ newPassword: form.newPassword }),
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if(res.ok) {
            setMessage({ type: "success", text: "Password berhasil diganti! Silakan login ulang nanti." });
            setForm({ newPassword: "", confirmPassword: "" });
        } else {
            setMessage({ type: "error", text: data.message || "Gagal mengganti password." });
        }
    } catch (err) {
        setMessage({ type: "error", text: "Terjadi kesalahan koneksi." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6">
      
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
            <ShieldCheck className="text-white" size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Keamanan Akun</h1>
            <p className="text-slate-500 text-sm">Update password Anda secara berkala untuk keamanan.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-700 border-b pb-4">
            <KeyRound className="text-indigo-600" size={20}/> Form Ganti Password
        </h2>

        {/* Alert Message */}
        {message.text && (
            <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm animate-fadeIn ${
                message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
                {message.type === 'success' ? <CheckCircle size={20} className="shrink-0"/> : <AlertCircle size={20} className="shrink-0"/>}
                <span className="font-semibold">{message.text}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Password Baru */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password Baru</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition" size={18}/>
                    <input 
                        type={showPass ? "text" : "password"} 
                        required
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
                        placeholder="Minimal 6 karakter"
                        value={form.newPassword}
                        onChange={e=>setForm({...form, newPassword: e.target.value})}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
            </div>

            {/* Input Konfirmasi Password */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Konfirmasi Password</label>
                <div className="relative group">
                    <CheckCircle className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition" size={18}/>
                    <input 
                        type={showConfirm ? "text" : "password"} 
                        required
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
                        placeholder="Ulangi password baru"
                        value={form.confirmPassword}
                        onChange={e=>setForm({...form, confirmPassword: e.target.value})}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>
            </div>

            <div className="pt-4">
                <button 
                    disabled={loading} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Menyimpan...</>
                    ) : (
                        <><Save size={20}/> Simpan Password Baru</>
                    )}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}