import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const FIELDS = {
  Pregnancies:              { label: "Pregnancies",         unit: "count", icon: "👶", min: 0,  max: 20,   step: 1,    hint: "Number of times pregnant" },
  Glucose:                  { label: "Glucose Level",       unit: "mg/dL", icon: "🩸", min: 0,  max: 300,  step: 1,    hint: "Plasma glucose concentration" },
  BloodPressure:            { label: "Blood Pressure",      unit: "mmHg",  icon: "💓", min: 0,  max: 150,  step: 1,    hint: "Diastolic blood pressure" },
  SkinThickness:            { label: "Skin Thickness",      unit: "mm",    icon: "📏", min: 0,  max: 100,  step: 1,    hint: "Triceps skinfold thickness" },
  Insulin:                  { label: "Insulin Level",       unit: "μU/mL", icon: "💉", min: 0,  max: 900,  step: 1,    hint: "2-Hour serum insulin" },
  BMI:                      { label: "BMI",                 unit: "kg/m²", icon: "⚖️", min: 0,  max: 70,   step: 0.1,  hint: "Body mass index" },
  DiabetesPedigreeFunction: { label: "Diabetes Pedigree",   unit: "score", icon: "🧬", min: 0,  max: 3,    step: 0.001,hint: "Genetic diabetes likelihood" },
  Age:                      { label: "Age",                 unit: "years", icon: "🎂", min: 0,  max: 120,  step: 1,    hint: "Age in years" },
};

const EMPTY_FORM = Object.fromEntries(Object.keys(FIELDS).map(k => [k, ""]));

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("predict");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("diabetesCurrentUser") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    const hist = JSON.parse(localStorage.getItem(`diabetesHistory_${u.email}`) || "[]");
    setHistory(hist);
  }, [navigate]);

  const saveHistory = (u, entry, hist) => {
    const updated = [entry, ...hist].slice(0, 50);
    localStorage.setItem(`diabetesHistory_${u.email}`, JSON.stringify(updated));
    setHistory(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, v === "" ? 0 : Number(v)])
        )),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || `Error ${res.status}`); }
      const data = await res.json();
      setResult(data);
      if (user) {
        saveHistory(user, { ...data, inputs: { ...form }, date: new Date().toISOString() }, history);
      }
    } catch (err) {
      setError(err.message === "Failed to fetch"
        ? "Cannot reach backend at http://127.0.0.1:8000 — is the server running?"
        : err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("diabetesCurrentUser");
    navigate("/login");
  };

  const stats = {
    total: history.length,
    highRisk: history.filter(h => h.diabetes).length,
    lowRisk: history.filter(h => !h.diabetes).length,
    avgProb: history.length ? Math.round(history.reduce((s, h) => s + h.probability, 0) / history.length) : 0,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "#0f1117" }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
        style={{ background: "linear-gradient(180deg,#0f0c29,#1a1740)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>🏥</div>
          <div>
            <div className="text-white font-bold text-base">DiabetesAI</div>
            <div className="text-white/40 text-xs">Health Analytics</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "predict",  icon: "🔍", label: "Predict Risk" },
            { id: "history",  icon: "📋", label: "History" },
            { id: "stats",    icon: "📊", label: "Analytics" },
            { id: "remedies", icon: "💊", label: "Remedies" },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === item.id
                  ? "text-white shadow-lg"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              style={activeTab === item.id ? { background: "linear-gradient(135deg,rgba(124,58,237,0.4),rgba(37,99,235,0.4))", border: "1px solid rgba(139,92,246,0.4)" } : {}}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user.name}</div>
              <div className="text-white/40 text-xs truncate">{user.email}</div>
            </div>
          </div>
          <button onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-white/10"
          style={{ background: "rgba(15,17,23,0.8)", backdropFilter: "blur(20px)" }}>
          <button className="lg:hidden text-white/60 hover:text-white transition-colors text-xl"
            onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">
              {activeTab === "predict" ? "🔍 Predict Diabetes Risk"
                : activeTab === "history" ? "📋 Prediction History"
                : activeTab === "stats" ? "📊 Analytics"
                : "💊 Medicines & Remedies"}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              Welcome back, {user.name?.split(" ")[0]}
            </p>
          </div>
          <div className="text-white/50 text-sm hidden sm:block">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "remedies" && <RemediesView />}
          {/* ── PREDICT TAB ── */}
          {activeTab === "predict" && (
            <div className="max-w-3xl mx-auto">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Tests",   value: stats.total,    icon: "🧪", color: "#7c3aed" },
                  { label: "High Risk",     value: stats.highRisk, icon: "⚠️", color: "#ef4444" },
                  { label: "Low Risk",      value: stats.lowRisk,  icon: "✅", color: "#10b981" },
                  { label: "Avg Risk %",    value: `${stats.avgProb}%`, icon: "📈", color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 border border-white/10 transition-transform hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-white/40 text-xs mt-1">{s.label}</div>
                    <div className="mt-2 h-0.5 rounded-full" style={{ background: s.color, opacity: 0.6 }} />
                  </div>
                ))}
              </div>

              {/* Form Card */}
              <div className="rounded-3xl border border-white/10 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="p-6 border-b border-white/10"
                  style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15))" }}>
                  <h2 className="text-white font-bold text-lg">Health Parameters</h2>
                  <p className="text-white/50 text-sm mt-1">Enter your clinical measurements for AI analysis</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                    {Object.entries(FIELDS).map(([key, meta]) => (
                      <div key={key}>
                        <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                          <span className="ml-auto text-white/30 text-xs font-normal">{meta.unit}</span>
                        </label>
                        <input
                          type="number"
                          name={key}
                          value={form[key]}
                          min={meta.min}
                          max={meta.max}
                          step={meta.step}
                          placeholder={meta.hint}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 outline-none transition-all border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-5 p-4 rounded-xl border border-red-500/30 flex items-start gap-3"
                      style={{ background: "rgba(239,68,68,0.1)" }}>
                      <span className="text-xl">🔴</span>
                      <div>
                        <p className="text-red-400 font-semibold text-sm">Connection Error</p>
                        <p className="text-red-400/80 text-xs mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="submit" disabled={loading}
                      className="flex-1 py-4 rounded-xl font-bold text-white text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl"
                      style={{ background: loading ? "#4c1d95" : "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Analyzing...
                        </span>
                      ) : "🔍 Analyze Risk"}
                    </button>
                    <button type="button" onClick={() => { setForm(EMPTY_FORM); setResult(null); setError(null); }}
                      className="px-5 py-4 rounded-xl text-white/50 hover:text-white border border-white/10 hover:border-white/30 transition-all text-sm font-medium">
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {/* Result */}
              {result && (
                <div className={`mt-6 rounded-3xl border-2 overflow-hidden animate-fade-in ${result.diabetes ? "border-red-500/40" : "border-emerald-500/40"}`}
                  style={{ background: result.diabetes ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)" }}>
                  <div className="p-6 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ${result.diabetes ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                      {result.diabetes ? "⚠️" : "✅"}
                    </div>
                    <h3 className={`text-2xl font-bold mb-1 ${result.diabetes ? "text-red-400" : "text-emerald-400"}`}>
                      {result.diabetes ? "Diabetes Risk Detected" : "Low Diabetes Risk"}
                    </h3>
                    <p className="text-white/60 text-sm mb-6">Based on your clinical parameters</p>

                    {/* Gauge */}
                    <div className="max-w-sm mx-auto">
                      <div className="flex justify-between text-xs text-white/40 mb-1">
                        <span>0%</span>
                        <span className="font-bold text-base" style={{ color: result.diabetes ? "#ef4444" : "#10b981" }}>
                          {result.probability}% Risk
                        </span>
                        <span>100%</span>
                      </div>
                      <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${result.probability}%`,
                            background: result.diabetes
                              ? "linear-gradient(90deg,#f97316,#ef4444)"
                              : "linear-gradient(90deg,#34d399,#10b981)"
                          }} />
                      </div>
                    </div>

                    {result.diabetes && (
                      <div className="mt-4 p-3 rounded-xl text-sm text-red-300/80 border border-red-500/20"
                        style={{ background: "rgba(239,68,68,0.08)" }}>
                        ⚕️ Please consult a licensed healthcare professional for a proper medical diagnosis.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl border border-white/10 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-white font-bold text-lg">Prediction History</h2>
                  <p className="text-white/50 text-sm">{history.length} total predictions</p>
                </div>
                {history.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-white/50">No predictions yet. Run your first analysis!</p>
                    <button onClick={() => setActiveTab("predict")}
                      className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition-all"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                      Start Predicting →
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {history.map((h, i) => (
                      <div key={i} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${h.diabetes ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                          {h.diabetes ? "⚠️" : "✅"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${h.diabetes ? "text-red-400" : "text-emerald-400"}`}>
                            {h.diabetes ? "High Risk" : "Low Risk"}
                          </div>
                          <div className="text-white/40 text-xs mt-0.5">
                            {new Date(h.date).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${h.diabetes ? "text-red-400" : "text-emerald-400"}`}>
                            {h.probability}%
                          </div>
                          <div className="text-white/30 text-xs">probability</div>
                        </div>
                        <div className="w-16">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{
                                width: `${h.probability}%`,
                                background: h.diabetes ? "#ef4444" : "#10b981"
                              }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "stats" && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Risk Distribution */}
              <div className="rounded-3xl border border-white/10 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
                <h2 className="text-white font-bold text-lg mb-5">📊 Risk Distribution</h2>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "High Risk", count: stats.highRisk, color: "#ef4444", icon: "⚠️" },
                    { label: "Low Risk",  count: stats.lowRisk,  color: "#10b981", icon: "✅" },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-5 border border-white/10 text-center"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="text-4xl mb-3">{s.icon}</div>
                      <div className="text-4xl font-bold" style={{ color: s.color }}>{s.count}</div>
                      <div className="text-white/50 text-sm mt-1">{s.label} Predictions</div>
                      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: stats.total ? `${(s.count / stats.total) * 100}%` : "0%", background: s.color }} />
                      </div>
                      <div className="text-white/30 text-xs mt-1">
                        {stats.total ? Math.round((s.count / stats.total) * 100) : 0}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Analyses",     value: stats.total,        icon: "🧪", color: "#7c3aed" },
                  { label: "Avg Risk Score",      value: `${stats.avgProb}%`, icon: "📈", color: "#f59e0b" },
                  { label: "High Risk Rate",      value: stats.total ? `${Math.round((stats.highRisk/stats.total)*100)}%` : "—", icon: "🎯", color: "#ef4444" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 border border-white/10 transition-transform hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-white/40 text-xs mt-1">{s.label}</div>
                    <div className="mt-3 h-1 rounded-full" style={{ background: s.color, opacity: 0.7 }} />
                  </div>
                ))}
              </div>

              {stats.total === 0 && (
                <div className="rounded-3xl border border-white/10 p-12 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-white/50">Run some predictions to see analytics here.</p>
                  <button onClick={() => setActiveTab("predict")}
                    className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-medium"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
                    Start Predicting →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full border border-white/10 text-center animate-fade-up"
            style={{ background: "#1a1740" }}>
            <div className="text-5xl mb-4">🚪</div>
            <h3 className="text-white font-bold text-xl mb-2">Sign out?</h3>
            <p className="text-white/50 text-sm mb-6">You'll need to log in again to access your dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl text-white/70 border border-white/10 hover:bg-white/5 transition-all font-medium">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-3 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RemediesView() {
  const categories = [
    {
      title: "🍎 Dietary Guidelines",
      icon: "🥗",
      items: [
        { name: "Low-GI Foods", desc: "Focus on oats, lentils, and non-starchy vegetables to prevent glucose spikes." },
        { name: "Fiber Intake", desc: "Consume 25-30g of fiber daily to improve insulin sensitivity." },
        { name: "Sugar Control", desc: "Eliminate refined sugars and processed fruit juices." }
      ]
    },
    {
      title: "🏃 Lifestyle & Exercise",
      icon: "👟",
      items: [
        { name: "Aerobic Activity", desc: "150 mins of brisk walking or swimming per week is highly effective." },
        { name: "Strength Training", desc: "Build muscle to help your body utilize glucose more efficiently." },
        { name: "Sleep Hygiene", desc: "Target 7-8 hours of sleep to maintain hormonal balance." }
      ]
    },
    {
      title: "💊 Common Medications",
      icon: "🏥",
      items: [
        { name: "Metformin", desc: "Often the first medication prescribed to improve insulin handling." },
        { name: "SGLT2 Inhibitors", desc: "Helps kidneys remove excess sugar through urine." },
        { name: "GLP-1 Agonists", desc: "Injectable medications that mimic natural hormones to lower sugar." }
      ]
    },
    {
      title: "🌿 Natural Supports",
      icon: "🍵",
      items: [
        { name: "Cinnamon", desc: "Some studies show it may slightly improve blood sugar levels." },
        { name: "Fenugreek", desc: "High soluble fiber content may slow sugar absorption." },
        { name: "Hydration", desc: "Drinking enough water helps kidneys flush out excess sugar." }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <div key={i} className="rounded-3xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="p-5 border-b border-white/10 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="text-2xl">{cat.icon}</span>
              <h3 className="text-white font-bold">{cat.title}</h3>
            </div>
            <div className="p-5 space-y-4">
              {cat.items.map((item, j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-1 h-auto rounded-full bg-violet-500/40" />
                  <div>
                    <div className="text-white font-semibold text-sm">{item.name}</div>
                    <div className="text-white/40 text-xs mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
        <p className="text-amber-200/80 text-xs">
          ⚠️ <b>Disclaimer:</b> This information is for educational purposes only. Always consult your doctor before starting any new medication or major dietary change.
        </p>
      </div>
    </div>
  );
}
