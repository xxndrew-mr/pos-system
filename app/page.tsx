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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bs-scene {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #3a5a4a 0%, #2d4a3e 40%, #1e3530 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .bs-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .bs-logo {
          position: absolute;
          top: 24px;
          left: 32px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 20;
        }
        .bs-logo span {
          font-size: 14px;
          color: #8abf9a;
          letter-spacing: 0.5px;
        }

        .bs-card {
          position: relative;
          z-index: 10;
          background: white;
          width: 360px;
          padding: 48px 52px 44px;
          border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%;
          animation: bsFloat 7s ease-in-out infinite;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        @keyframes bsFloat {
          0%, 100% { border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%; }
          50%       { border-radius: 50% 50% 45% 55% / 55% 45% 55% 45%; }
        }

        .bs-title {
          margin-bottom: 32px;
          line-height: 1.2;
        }
        .bs-title-sub {
          font-size: 15px;
          color: #9aaa9a;
          font-weight: 300;
        }
        .bs-title-main {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #2d3a30;
        }

        .bs-field {
          width: 100%;
          margin-bottom: 20px;
        }
        .bs-label {
          display: block;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 6px;
        }
        .bs-input-wrap {
          position: relative;
        }
        .bs-input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #ddd;
          outline: none;
          font-size: 13px;
          color: #444;
          padding: 6px 8px 6px 26px;
          font-family: 'DM Sans', sans-serif;
          background: transparent;
          transition: border-color 0.25s;
        }
        .bs-input::placeholder { color: #bbb; }
        .bs-input:focus { border-bottom-color: #6aaa7a; }

        .bs-icon-left {
          position: absolute;
          left: 0;
          bottom: 7px;
          color: #bbb;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .bs-btn {
          margin-top: 24px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #e8a84a, #d4873a);
          color: white;
          border: none;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 6px 20px rgba(232,168,74,0.4);
          font-family: 'DM Sans', sans-serif;
        }
        .bs-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(232,168,74,0.5);
        }
        .bs-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .bs-social {
          position: absolute;
          bottom: 28px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          z-index: 5;
        }
        .bs-social-label {
          font-size: 12px;
          color: #a8c8b8;
        }
        .bs-social-icons { display: flex; gap: 10px; }
        .bs-social-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s;
        }
        .bs-social-icon:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      <div className="bs-scene">

        {/* Botanical SVG background */}
        <svg className="bs-bg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="1100" cy="180" rx="380" ry="260" fill="#3a6a50" opacity="0.45" />
          <ellipse cx="1250" cy="680" rx="320" ry="360" fill="#2a4a3a" opacity="0.55" />
          <ellipse cx="160" cy="700" rx="280" ry="250" fill="#3a5a45" opacity="0.4" />
          <ellipse cx="60" cy="200" rx="220" ry="320" fill="#2a4a38" opacity="0.45" />
          <path d="M0 760 Q80 640 40 560 Q120 620 60 760Z" fill="#4a7a5a" opacity="0.85" />
          <path d="M20 840 Q120 680 100 580 Q180 660 120 840Z" fill="#5a8a68" opacity="0.75" />
          <path d="M60 900 Q180 720 160 600 Q240 700 160 900Z" fill="#3d6b4e" opacity="0.9" />
          <path d="M0 900 Q100 760 80 680" stroke="#6aaa7a" strokeWidth="3" fill="none" opacity="0.4" />
          <path d="M140 900 Q150 800 160 780 Q170 800 160 900Z" fill="#5a9a6a" opacity="0.8" />
          <path d="M170 900 Q190 820 200 790 Q210 820 190 900Z" fill="#4a8a5a" opacity="0.7" />
          <path d="M110 900 Q120 830 130 810 Q140 830 124 900Z" fill="#6aaa78" opacity="0.6" />
          <path d="M1160 0 Q1300 80 1400 20 Q1360 160 1200 120Z" fill="#4a7a5a" opacity="0.7" />
          <path d="M1240 20 Q1400 120 1440 60 L1440 200 Q1260 160 1240 20Z" fill="#3d6b4e" opacity="0.8" />
          <path d="M1120 100 Q1280 200 1360 120 Q1320 260 1160 200Z" fill="#5a8a68" opacity="0.6" />
          <path d="M1320 300 Q1440 360 1440 280 L1440 440 Q1360 400 1320 300Z" fill="#4a7a58" opacity="0.7" />
          <path d="M1280 400 Q1420 460 1440 380 L1440 540 Q1340 520 1280 400Z" fill="#3a6a48" opacity="0.6" />
          <path d="M1100 160 Q1240 260 1280 200 Q1240 360 1100 300Z" fill="#d4a06a" opacity="0.45" />
          <path d="M1140 240 Q1280 340 1300 280 Q1280 420 1140 360Z" fill="#c49060" opacity="0.38" />
          <path d="M1200 760 Q1320 680 1440 720 L1440 900 L1200 900Z" fill="#3a5a45" opacity="0.8" />
          <path d="M1280 800 Q1380 720 1440 760 L1440 900 L1280 900Z" fill="#4a6a52" opacity="0.7" />
          <path d="M1360 840 Q1400 760 1440 800 L1440 900 L1360 900Z" fill="#5a7a60" opacity="0.6" />
          <path d="M1400 900 Q1396 700 1390 560" stroke="#5a8a68" strokeWidth="4" fill="none" />
          <path d="M1390 560 Q1440 520 1410 480" fill="#5a8a68" opacity="0.7" />
          <path d="M1390 600 Q1350 570 1360 530" fill="#4a7a58" opacity="0.6" />
          <circle cx="1360" cy="440" r="8" fill="#c4b06a" opacity="0.8" />
          <circle cx="1374" cy="424" r="6" fill="#b4a05a" opacity="0.7" />
          <circle cx="1350" cy="430" r="7" fill="#d4c07a" opacity="0.7" />
          <circle cx="1386" cy="450" r="5" fill="#c4b06a" opacity="0.6" />
          <path d="M200 400 Q260 360 300 400 Q280 460 200 400Z" fill="#5a8a68" opacity="0.35" />
          <path d="M120 480 Q180 440 220 480 Q190 530 120 480Z" fill="#4a7a58" opacity="0.3" />
        </svg>

        {/* Logo */}
        <div className="bs-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4 Q18 8 22 6 Q20 12 16 14 Q20 16 22 22 Q18 20 14 24 Q10 20 6 22 Q8 16 12 14 Q8 12 6 6 Q10 8 14 4Z" fill="#e8a84a" />
            <circle cx="14" cy="14" r="3" fill="#d4873a" />
          </svg>
          <span>Kasir Maelika Butik</span>
        </div>

        {/* Blob Card */}
        <div className="bs-card">
          <div className="bs-title">
            <div className="bs-title-sub">Hello there,</div>
            <div className="bs-title-main">Kasir Maelika Butik</div>
          </div>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column" }}>

            {/* Username */}
            <div className="bs-field">
              <label className="bs-label">Username</label>
              <div className="bs-input-wrap">
                <span className="bs-icon-left"><User size={16} /></span>
                <input
                  type="text"
                  className="bs-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="bs-field">
              <label className="bs-label">Password</label>
              <div className="bs-input-wrap">
                <span className="bs-icon-left"><Lock size={16} /></span>
                <input
                  type="password"
                  className="bs-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="bs-btn" disabled={loading}>
              {loading ? "Memproses..." : "Sign In"}
            </button>

          </form>
        </div>

        {/* Social */}
        <div className="bs-social">

        </div>

      </div>
    </>
  );
}