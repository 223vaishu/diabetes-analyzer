import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("diabetesUsers") || "[]");
      if (stored.find(u => u.email === form.email)) {
        setErrors({ email: "An account with this email already exists" });
        setLoading(false);
        return;
      }
      const newUser = { name: form.name, email: form.email, password: form.password, joined: new Date().toISOString() };
      stored.push(newUser);
      localStorage.setItem("diabetesUsers", JSON.stringify(stored));
      localStorage.setItem("diabetesCurrentUser", JSON.stringify(newUser));
      navigate("/dashboard");
    }, 900);
  };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strVal = strength();
  const strColor = ["#ef4444","#f97316","#eab308","#22c55e","#10b981"][Math.min(strVal - 1, 4)] || "#374151";
  const strLabel = ["","Weak","Fair","Good","Strong","Very Strong"][strVal] || "";

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute -top-32 -right-32 w-96 h-96 opacity-20"
          style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)" }} />
        <div className="animate-blob absolute bottom-0 -left-20 w-80 h-80 opacity-20"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)", animationDelay: "4s" }} />
      </div>

      {/* Left Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-16 relative z-10">
        <div className="animate-float mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl"
            style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>🩺</div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 text-center leading-tight">
          Join the<br />
          <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Health Revolution
          </span>
        </h1>
        <p className="text-white/60 text-lg text-center max-w-xs">
          Track your health metrics and get personalized AI-powered diabetes risk assessments.
        </p>

        <div className="mt-12 space-y-4 w-full max-w-xs">
          {[
            { icon: "📊", title: "Personal Dashboard", desc: "Track all your predictions" },
            { icon: "🧠", title: "AI Analytics", desc: "ML-powered risk insights" },
            { icon: "📋", title: "Prediction History", desc: "Review past assessments" },
          ].map(f => (
            <div key={f.title} className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="text-2xl">{f.icon}</div>
              <div>
                <div className="text-white font-semibold text-sm">{f.title}</div>
                <div className="text-white/50 text-xs">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 relative z-10">
        <div className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-up">
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 lg:hidden"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)" }}>🩺</div>
            <h2 className="text-3xl font-bold text-white">Create account</h2>
            <p className="text-white/50 mt-1">Start your health journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Full name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">👤</span>
                <input type="text" placeholder="John Doe" value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.name ? "bg-red-500/10 border-2 border-red-500/60" : "bg-white/10 border-2 border-white/10 focus:border-blue-500/70 focus:bg-white/15"}`}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">✉️</span>
                <input type="text" placeholder="you@example.com" value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.email ? "bg-red-500/10 border-2 border-red-500/60" : "bg-white/10 border-2 border-white/10 focus:border-blue-500/70 focus:bg-white/15"}`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔑</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.password ? "bg-red-500/10 border-2 border-red-500/60" : "bg-white/10 border-2 border-white/10 focus:border-blue-500/70 focus:bg-white/15"}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strVal ? strColor : "#374151" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strColor }}>{strLabel}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Confirm password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔒</span>
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.confirm}
                  onChange={e => { setForm({ ...form, confirm: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.confirm ? "bg-red-500/10 border-2 border-red-500/60" : "bg-white/10 border-2 border-white/10 focus:border-blue-500/70 focus:bg-white/15"}`}
                />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{ background: loading ? "#1e3a8a" : "linear-gradient(135deg,#2563eb,#7c3aed)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
