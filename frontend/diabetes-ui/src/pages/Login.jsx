import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("diabetesUsers") || "[]");
      const user = stored.find(u => u.email === form.email && u.password === form.password);
      if (user) {
        localStorage.setItem("diabetesCurrentUser", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setErrors({ general: "Invalid email or password" });
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-blob absolute -top-32 -left-32 w-96 h-96 opacity-20"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent 70%)" }} />
        <div className="animate-blob absolute top-1/2 -right-20 w-80 h-80 opacity-20"
          style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)", animationDelay: "3s" }} />
        <div className="animate-blob absolute bottom-0 left-1/3 w-72 h-72 opacity-10"
          style={{ background: "radial-gradient(circle,#06b6d4,transparent 70%)", animationDelay: "5s" }} />
      </div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 px-16 relative z-10">
        <div className="animate-float mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
            🏥
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 text-center leading-tight">
          Diabetes<br />
          <span style={{ background: "linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Analyzer
          </span>
        </h1>
        <p className="text-white/60 text-lg text-center max-w-xs">
          AI-powered clinical decision support for early diabetes risk detection.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { icon: "🎯", label: "98% Accuracy" },
            { icon: "⚡", label: "Instant Results" },
            { icon: "🔒", label: "Private & Secure" },
          ].map(f => (
            <div key={f.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-white/70 text-xs font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 relative z-10">
        <div className="glass rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 lg:hidden"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>🏥</div>
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-white/50 mt-1">Sign in to your account</p>
          </div>

          {errors.general && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">✉️</span>
                <input
                  type="text"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.email
                      ? "bg-red-500/10 border-2 border-red-500/60"
                      : "bg-white/10 border-2 border-white/10 focus:border-violet-500/70 focus:bg-white/15"
                    }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-white/70 text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">🔑</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl text-white placeholder-white/30 outline-none transition-all
                    ${errors.password
                      ? "bg-red-500/10 border-2 border-red-500/60"
                      : "bg-white/10 border-2 border-white/10 focus:border-violet-500/70 focus:bg-white/15"
                    }`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{ background: loading ? "#4c1d95" : "linear-gradient(135deg,#7c3aed,#2563eb)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
