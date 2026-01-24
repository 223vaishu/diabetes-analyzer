from fastapi import FastAPI, HTTPException
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


def _to_float(value, name):
    if value is None:
        raise HTTPException(status_code=422, detail=f"{name} is required")
    if isinstance(value, str) and value.strip() == "":
        raise HTTPException(status_code=422, detail=f"{name} must be a number")
    try:
        return float(value)
    except (TypeError, ValueError):
        raise HTTPException(status_code=422, detail=f"{name} must be a number")

model = joblib.load("./model/diabetes_model.pkl")
scaler = joblib.load("./model/scaler.pkl")

@app.post("/predict")
def predict(data: dict):
    features = np.array([[
        _to_float(data.get("Pregnancies"), "Pregnancies"),
        _to_float(data.get("Glucose"), "Glucose"),
        _to_float(data.get("BloodPressure"), "BloodPressure"),
        _to_float(data.get("SkinThickness"), "SkinThickness"),
        _to_float(data.get("Insulin"), "Insulin"),
        _to_float(data.get("BMI"), "BMI"),
        _to_float(data.get("DiabetesPedigreeFunction"), "DiabetesPedigreeFunction"),
        _to_float(data.get("Age"), "Age")
    ]])

    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0][1]

    return {
        "diabetes": bool(prediction),
        "probability": round(probability * 100, 2)
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
