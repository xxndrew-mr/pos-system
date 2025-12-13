"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      alert("Login Gagal! Cek username/password.");
      setLoading(false);
    } else {
      router.refresh();
      router.push("/dashboard/products");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">
          Kasir Maelika Butik
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 pl-10 py-2.5 text-sm 
                           text-gray-900 placeholder-gray-400 
                           focus:border-blue-600 focus:ring-blue-600 transition-all"
                placeholder="admin"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 pl-10 py-2.5 text-sm 
                           text-gray-900 placeholder-gray-400
                           focus:border-blue-600 focus:ring-blue-600 transition-all"
                placeholder="•••••••"
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 
                       transition-all shadow-md hover:shadow-lg disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>

        {/* Default Credential Info */}
        <div className="mt-5 text-center text-xs text-gray-500 bg-gray-100 p-3 rounded-lg border border-gray-200">
          <p className="font-medium mb-1 text-gray-700">Default Credentials:</p>
          <p>Admin → <span className="font-semibold">admin / admin123</span></p>
          <p>Kasir → <span className="font-semibold">kasir / kasir123</span></p>
        </div>
      </div>
    </div>
  );
}
