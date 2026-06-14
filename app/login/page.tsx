"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/services/authservice";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError("");
    if (val.length > 3) {
      setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    } else {
      setEmailValid(null);
    }
  };

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .erp-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f0f4ff;
        }

        /* ── LEFT PANEL ── */
        .erp-left {
          flex: 1;
          position: relative;
          background: linear-gradient(145deg, #0a1628 0%, #0d2350 45%, #1549a8 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 52px;
        }
        @media (max-width: 768px) { .erp-left { display: none; } }

        .erp-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          from { background-position: 0 0; }
          to   { background-position: 48px 48px; }
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.3;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb1 { width: 380px; height: 380px; background: #1a56db; top: -80px; right: -60px; }
        .orb2 { width: 260px; height: 260px; background: #00c6a2; bottom: 18%; left: -50px; animation-delay: -3s; }
        .orb3 { width: 180px; height: 180px; background: #f59e0b; top: 38%; right: 12%; animation-delay: -5s; }

        @keyframes orbFloat {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-28px) scale(1.04); }
        }

        /* Floating metric cards */
        .fcards { position: absolute; inset: 0; }
        .fcard {
          position: absolute;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(14px);
          border-radius: 16px;
          padding: 14px 18px;
          color: white;
          animation: cardDrift linear infinite;
          min-width: 155px;
        }
        .fcard-lbl  { font-size: 10px; opacity:.5; letter-spacing:.08em; text-transform:uppercase; margin-bottom:3px; }
        .fcard-val  { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; }
        .fcard-sub  { font-size:11px; margin-top:2px; }
        .up   { color:#00c6a2; }
        .down { color:#f87171; }

        .fc1 { top:11%; left:7%;  animation-duration:6s;   animation-delay:0s;  }
        .fc2 { top:27%; right:5%; animation-duration:7.5s; animation-delay:-2s; }
        .fc3 { top:58%; left:5%; animation-duration:8s;   animation-delay:-4s; }
        .fc4 { top:70%; right:7%; animation-duration:6.5s; animation-delay:-1s; }

        @keyframes cardDrift {
          0%,100% { transform: translateY(0)    rotate(0deg); }
          40%      { transform: translateY(-10px) rotate(.4deg); }
          70%      { transform: translateY(7px)  rotate(-.2deg); }
        }

        .sparks { display:flex; align-items:flex-end; gap:3px; height:26px; margin-top:8px; }
        .sb  { flex:1; border-radius:3px 3px 0 0; background:rgba(255,255,255,.18); }
        .sba { background:#00c6a2; }

        /* AI orb */
        .ai-orb {
          position:absolute; top:44%; left:50%;
          transform: translate(-50%,-50%);
          width:86px; height:86px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.15);
          backdrop-filter:blur(18px);
          border-radius:50%;
          display:flex; align-items:center; justify-content:center; flex-direction:column;
          animation: aiPulse 3s ease-in-out infinite;
        }
        .ai-orb span { font-size:8px; color:rgba(255,255,255,.5); letter-spacing:.12em; text-transform:uppercase; margin-top:2px; }
        @keyframes aiPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(26,86,219,.45); }
          50%      { box-shadow: 0 0 0 22px rgba(26,86,219,0); }
        }

        /* Left copy */
        .left-copy { position:relative; z-index:2; }
        .left-tag  { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.4); margin-bottom:12px; }
        .left-copy h1 {
          font-family:'Syne',sans-serif; font-size:38px; font-weight:800;
          color:#fff; line-height:1.15; margin-bottom:14px;
        }
        .left-copy h1 em {
          font-style:normal;
          background: linear-gradient(90deg,#00c6a2,#60a5fa);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        }
        .left-copy p { font-size:14px; color:rgba(255,255,255,.45); line-height:1.7; max-width:360px; margin-bottom:28px; }

        .pills { display:flex; flex-wrap:wrap; gap:7px; }
        .pill  {
          display:flex; align-items:center; gap:5px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.11);
          border-radius:100px; padding:5px 12px;
          font-size:11px; color:rgba(255,255,255,.7);
        }
        .dot { width:5px; height:5px; border-radius:50%; background:#00c6a2; flex-shrink:0; }

        /* ── RIGHT PANEL ── */
        .erp-right {
          width: 460px; flex-shrink:0;
          background:#fff;
          display:flex; flex-direction:column; justify-content:center;
          padding: 52px 48px;
          position:relative;
          overflow-y:auto;
        }
        @media (max-width: 768px) { .erp-right { width:100%; padding:40px 28px; } }

        /* Top bar */
        .topbar {
          position:absolute; top:28px; left:48px; right:48px;
          display:flex; justify-content:space-between; align-items:center;
        }
        @media (max-width: 768px) { .topbar { left:28px; right:28px; } }

        .logo { display:flex; align-items:center; gap:9px; }
        .logo-mark {
          width:32px; height:32px;
          background:linear-gradient(135deg,#1a56db,#00c6a2);
          border-radius:9px;
          display:flex; align-items:center; justify-content:center;
        }
        .logo-name { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; color:#0f172a; letter-spacing:-.02em; }
        .logo-name span { color:#1a56db; }

        .badge {
          font-size:11px; background:#eff6ff;
          color:#1a56db; border:1px solid #bfdbfe;
          border-radius:100px; padding:4px 10px; font-weight:500;
        }

        /* Form */
        .form-wrap { padding-top:76px; }

        .form-hd h2 { font-family:'Syne',sans-serif; font-size:26px; font-weight:700; color:#0f172a; margin-bottom:6px; }
        .form-hd p  { font-size:13px; color:#64748b; margin-bottom:28px; }
        .form-hd p a { color:#1a56db; font-weight:500; text-decoration:none; }

        /* Error banner */
        .err-banner {
          background:#fef2f2; border:1px solid #fecaca;
          border-radius:12px; padding:10px 14px;
          font-size:13px; color:#b91c1c;
          display:flex; align-items:center; gap:8px;
          margin-bottom:18px;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

        /* Field */
        .field { margin-bottom:16px; }
        .field label { display:block; font-size:13px; font-weight:500; color:#0f172a; margin-bottom:6px; }

        .input-wrap { position:relative; display:flex; align-items:center; }
        .i-icon { position:absolute; left:14px; color:#94a3b8; display:flex; pointer-events:none; }
        .i-icon svg { width:17px; height:17px; }

        .erp-input {
          width:100%; height:50px;
          border:1.5px solid #e2e8f0;
          border-radius:13px;
          padding:0 44px;
          font-size:14px; color:#0f172a;
          background:#fff; outline:none;
          transition: border-color .2s, box-shadow .2s;
          font-family:'DM Sans',sans-serif;
        }
        .erp-input::placeholder { color:#94a3b8; }
        .erp-input:focus {
          border-color:#1a56db;
          box-shadow:0 0 0 3px rgba(26,86,219,.09);
        }
        .erp-input.valid   { border-color:#00c6a2; }
        .erp-input.invalid { border-color:#f87171; }

        .eye-btn {
          position:absolute; right:12px;
          background:none; border:none; cursor:pointer;
          color:#94a3b8; padding:4px; border-radius:8px;
          display:flex; transition:color .15s;
        }
        .eye-btn:hover { color:#1a56db; }

        .status-icon { position:absolute; right:40px; display:flex; }
        .status-icon svg { width:15px; height:15px; }

        /* Row */
        .row { display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; }

        .remember { display:flex; align-items:center; gap:7px; cursor:pointer; user-select:none; }
        .remember input { display:none; }
        .cb {
          width:17px; height:17px;
          border:1.5px solid #cbd5e1; border-radius:5px;
          display:flex; align-items:center; justify-content:center;
          transition:all .15s; flex-shrink:0;
        }
        .remember input:checked ~ .cb { background:#1a56db; border-color:#1a56db; }
        .cb-tick { display:none; }
        .remember input:checked ~ .cb .cb-tick { display:block; }
        .remember span { font-size:13px; color:#64748b; }

        .forgot { font-size:13px; color:#1a56db; font-weight:500; text-decoration:none; }
        .forgot:hover { text-decoration:underline; }

        /* Submit button */
        .btn-submit {
          width:100%; height:50px;
          background:linear-gradient(135deg,#1a56db 0%,#0f3d9e 100%);
          color:white; border:none; border-radius:13px;
          font-size:15px; font-weight:600;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
          transition: transform .15s, box-shadow .15s;
          position:relative; overflow:hidden;
          font-family:'Syne',sans-serif;
          letter-spacing:.01em;
        }
        .btn-submit:disabled { opacity:.7; cursor:not-allowed; transform:none !important; }
        .btn-submit:not(:disabled):hover {
          transform:translateY(-1px);
          box-shadow:0 8px 22px rgba(26,86,219,.4);
        }
        .btn-submit:not(:disabled):active { transform:translateY(0); }
        .btn-submit::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);
          opacity:0; transition:opacity .15s;
        }
        .btn-submit:not(:disabled):hover::before { opacity:1; }

        .arr-pill {
          width:20px; height:20px;
          background:rgba(255,255,255,.2); border-radius:50%;
          display:flex; align-items:center; justify-content:center;
        }

        /* Spinner */
        .spin {
          width:18px; height:18px;
          border:2px solid rgba(255,255,255,.3);
          border-top-color:white; border-radius:50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* Bottom */
        .signup-note { text-align:center; font-size:13px; color:#64748b; margin-top:22px; }
        .signup-note a { color:#1a56db; font-weight:500; text-decoration:none; }

        .sec-row {
          display:flex; align-items:center; justify-content:center; gap:16px;
          margin-top:24px; padding-top:20px;
          border-top:1px solid #f1f5f9;
        }
        .sec-item { display:flex; align-items:center; gap:4px; font-size:11px; color:#94a3b8; }
        .sec-item svg { width:13px; height:13px; color:#00c6a2; }

        /* Divider */
        .divider {
          display:flex; align-items:center; gap:10px; margin-bottom:22px;
        }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:#f1f5f9; }
        .divider span { font-size:11px; color:#94a3b8; white-space:nowrap; }

        /* Social */
        .social-row { display:flex; gap:10px; margin-bottom:22px; }
        .soc-btn {
          flex:1; height:42px;
          border:1.5px solid #e2e8f0; border-radius:11px;
          background:#fff; display:flex; align-items:center; justify-content:center; gap:7px;
          font-size:13px; font-weight:500; color:#0f172a;
          cursor:pointer; transition:all .15s;
          font-family:'DM Sans',sans-serif;
        }
        .soc-btn:hover { border-color:#1a56db; background:#eff6ff; color:#1a56db; }
        .soc-btn svg { width:16px; height:16px; flex-shrink:0; }

        /* Fade-in on mount */
        .fade-up {
          opacity: 0; transform: translateY(16px);
          animation: fadeUp .4s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="erp-root">

        {/* ── LEFT PANEL ── */}
        <div className="erp-left">
          <div className="erp-grid" />
          <div className="orb orb1" />
          <div className="orb orb2" />
          <div className="orb orb3" />

          <div className="fcards">
            <div className="fcard fc1">
              <div className="fcard-lbl">Monthly Revenue</div>
              <div className="fcard-val">₹42.8L</div>
              <div className="fcard-sub up">↑ 18.4% this month</div>
              <div className="sparks">
                {[40,55,45,70,60,85].map((h,i) => (
                  <div key={i} className={`sb${i===5?' sba':''}`} style={{ height:`${h}%` }} />
                ))}
              </div>
            </div>
            <div className="fcard fc2">
              <div className="fcard-lbl">AI Accuracy</div>
              <div className="fcard-val">97.2%</div>
              <div className="fcard-sub up">Prediction score</div>
              <div className="sparks">
                {[75,80,78,90,97].map((h,i) => (
                  <div key={i} className={`sb${i===4?' sba':''}`} style={{ height:`${h}%` }} />
                ))}
              </div>
            </div>
            <div className="fcard fc3">
              <div className="fcard-lbl">Active Users</div>
              <div className="fcard-val">2,841</div>
              <div className="fcard-sub" style={{color:'rgba(255,255,255,.4)'}}>Across 14 branches</div>
            </div>
            <div className="fcard fc4">
              <div className="fcard-lbl">Inventory</div>
              <div className="fcard-val">98.1%</div>
              <div className="fcard-sub up">Stock optimized</div>
            </div>
          </div>

          <div className="ai-orb">
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <path d="M12 18 Q18 8 24 18 Q18 28 12 18Z" fill="rgba(0,198,162,0.7)"/>
              <circle cx="18" cy="18" r="3" fill="white" opacity="0.9"/>
              {[9,27,0,18].map((cy,i) => {
                const cx = i < 2 ? 18 : (i===2 ? 9 : 27);
                return <circle key={i} cx={cx} cy={cy===18&&i>=2?18:cy} r="1.5" fill="rgba(255,255,255,0.5)"/>;
              })}
            </svg>
            <span>AI Core</span>
          </div>

          <div className="left-copy">
            <div className="left-tag">Enterprise Intelligence Platform</div>
            <h1>Run your entire<br/>business with <em>AI</em></h1>
            <p>One unified platform for Finance, HR, Inventory, Payroll, and Analytics — powered by real-time intelligence.</p>
            <div className="pills">
              {['Finance ERP','HR & Payroll','AI Analytics','Multi-Tenant','Cloud Native'].map(p => (
                <div key={p} className="pill">
                  <div className="dot" style={p==='Cloud Native'?{background:'#60a5fa'}:{}}/>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="erp-right">
          <div className="topbar">
            <div className="logo">
              <div className="logo-mark">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9 L9 4 L14 9 L9 14Z" fill="white" opacity="0.9"/>
                  <circle cx="9" cy="9" r="2.5" fill="white"/>
                </svg>
              </div>
              <div className="logo-name">Nexa<span>ERP</span></div>
            </div>
            <div className="badge">AI-Powered ✦</div>
          </div>

          {mounted && (
            <div className="form-wrap fade-up">
              <div className="form-hd">
                <h2>Welcome back 👋</h2>
                <p>
                  New to NexaERP?{" "}
                  <Link href="/register">Create a free account</Link>
                </p>
              </div>

              {/* Social login */}
              <div className="social-row">
                <button className="soc-btn" type="button">
                  <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google SSO
                </button>
                <button className="soc-btn" type="button">
                  <svg viewBox="0 0 24 24">
                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                    <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                    <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                  </svg>
                  Microsoft
                </button>
              </div>

              <div className="divider"><span>or continue with email</span></div>

              {/* Error banner */}
              {error && (
                <div className="err-banner">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="field">
                <label>Email</label>
                <div className="input-wrap">
                  <div className="i-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="email"
                    className={`erp-input ${emailValid === true ? 'valid' : emailValid === false ? 'invalid' : ''}`}
                  />
                  {emailValid !== null && (
                    <div className="status-icon">
                      {emailValid ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#00c6a2" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <div className="i-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="current-password"
                    className="erp-input"
                  />
                  <button
                    className="eye-btn"
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="row">
                <label className="remember">
                  <input type="checkbox" id="remember" />
                  <div className="cb">
                    <svg className="cb-tick" width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" className="forgot">Forgot password?</a>
              </div>

              {/* Login button */}
              <button
                className="btn-submit"
                onClick={handleLogin}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <div className="spin" />
                ) : (
                  <>
                    Sign In to NexaERP
                    <div className="arr-pill">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5h6M5 2l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </>
                )}
              </button>

              <div className="signup-note">
                Don&apos;t have an account?{" "}
                <Link href="/register">Request access</Link>
              </div>

              {/* Security row */}
              <div className="sec-row">
                {[
                  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "256-bit SSL" },
                  { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4", label: "2FA Ready" },
                  { icon: "M20 6L9 17l-5-5", label: "ISO 27001" },
                ].map(({ icon, label }) => (
                  <div key={label} className="sec-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={icon}/>
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}