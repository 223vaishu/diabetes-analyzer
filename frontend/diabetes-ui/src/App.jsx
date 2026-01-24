import { useState } from "react";

function App() {
  const [form, setForm] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value === "" ? "" : Number(value) });
  };

  const predict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Backend not running or API error");
    }

    setLoading(false);
  };

  const fieldLabels = {
    Pregnancies: { label: "Pregnancies", unit: "count", icon: "👶" },
    Glucose: { label: "Glucose Level", unit: "mg/dL", icon: "🩸" },
    BloodPressure: { label: "Blood Pressure", unit: "mm Hg", icon: "💓" },
    SkinThickness: { label: "Skin Thickness", unit: "mm", icon: "📏" },
    Insulin: { label: "Insulin Level", unit: "μU/mL", icon: "💉" },
    BMI: { label: "Body Mass Index", unit: "kg/m²", icon: "⚖️" },
    DiabetesPedigreeFunction: { label: "Diabetes Pedigree", unit: "score", icon: "🧬" },
    Age: { label: "Age", unit: "years", icon: "🎂" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-3xl">
                🏥
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">
              Diabetes Risk Predictor
            </h1>
            <p className="text-center text-blue-100">
              AI-powered health assessment tool
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {Object.keys(form).map((key) => (
                <div key={key} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-xl">{fieldLabels[key].icon}</span>
                    <span>{fieldLabels[key].label}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={`Enter ${fieldLabels[key].label.toLowerCase()}`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      {fieldLabels[key].unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={predict}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔍</span> Predict Diabetes Risk
                </span>
              )}
            </button>

            {/* Results */}
            {result && (
              <div className={`mt-6 p-6 rounded-xl animate-fade-in ${
                result.diabetes 
                  ? "bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200" 
                  : "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
              }`}>
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
                    result.diabetes ? "bg-red-200" : "bg-green-200"
                  }`}>
                    {result.diabetes ? "⚠️" : "✅"}
                  </div>
                </div>
                <h2 className={`text-2xl font-bold text-center mb-2 ${
                  result.diabetes ? "text-red-800" : "text-green-800"
                }`}>
                  {result.diabetes ? "Diabetes Risk Detected" : "Low Diabetes Risk"}
                </h2>
                <p className={`text-center text-lg ${
                  result.diabetes ? "text-red-700" : "text-green-700"
                }`}>
                  Risk Probability: <span className="font-bold text-2xl">{result.probability}%</span>
                </p>
                <div className="mt-4 bg-white/60 rounded-lg p-4">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        result.diabetes ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${result.probability}%` }}
                    />
                  </div>
                </div>
                {result.diabetes && (
                  <p className="mt-4 text-sm text-red-700 text-center">
                    ⚕️ Please consult a healthcare professional for proper diagnosis
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          ⚠️ This tool is for educational purposes only and not a substitute for professional medical advice
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
