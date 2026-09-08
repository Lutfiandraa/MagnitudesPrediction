from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import xgboost as xgb
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from math import radians, sin, cos, sqrt, atan2
from typing import Dict
import os

# Initialize FastAPI app
app = FastAPI(
    title="Earthquake Magnitude Classification API",
    description="API untuk klasifikasi magnitude gempa di sekitar Anak Krakatau menggunakan XGBoost",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Koordinat Anak Krakatau
KRAKATAU_LAT = -6.102
KRAKATAU_LON = 105.423

# Global variables untuk model dan encoders
model = None
le_target = None
le_remark = None

# Load model dan encoders saat startup
@app.on_event("startup")
async def load_model():
    global model, le_target, le_remark
    
    try:
        # Load XGBoost model
        model = xgb.XGBClassifier()
        model.load_model("xgb_magnitude_model.json")
        print("✓ Model XGBoost berhasil dimuat")
        
        # Load LabelEncoders
        le_target = joblib.load("le_target.pkl")
        print("✓ LabelEncoder target berhasil dimuat")
        
        le_remark = joblib.load("le_remark.pkl")
        print("✓ LabelEncoder remark berhasil dimuat")
        
        print(f"✓ Classes yang dikenali: {le_target.classes_}")
        print(f"✓ Jumlah wilayah (remark) yang dikenali: {len(le_remark.classes_)}")
        
    except Exception as e:
        print(f"✗ Error saat loading model: {str(e)}")
        raise


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Menghitung jarak antara dua koordinat geografis menggunakan formula Haversine.
    
    Args:
        lat1, lon1: Koordinat titik pertama (latitude, longitude)
        lat2, lon2: Koordinat titik kedua (latitude, longitude)
    
    Returns:
        Jarak dalam kilometer
    """
    # Radius bumi dalam kilometer
    R = 6371.0
    
    # Konversi ke radian
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    # Perbedaan koordinat
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Formula Haversine
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return distance


# Pydantic model untuk validasi input
class EarthquakeInput(BaseModel):
    lat: float = Field(..., description="Latitude gempa", ge=-90, le=90)
    lon: float = Field(..., description="Longitude gempa", ge=-180, le=180)
    depth: float = Field(..., description="Kedalaman gempa dalam km", ge=0)
    datetime: str = Field(..., description="Tanggal dan waktu gempa (format: YYYY-MM-DD HH:MM:SS)")
    remark: str = Field(..., description="Wilayah/lokasi gempa")
    
    class Config:
        json_schema_extra = {
            "example": {
                "lat": -6.15,
                "lon": 105.40,
                "depth": 10.5,
                "datetime": "2024-01-15 08:30:45",
                "remark": "Selat Sunda"
            }
        }


class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: Dict[str, float]
    dist_km: float
    input_data: Dict


@app.get("/")
async def root():
    """Root endpoint dengan informasi API"""
    return {
        "message": "Earthquake Magnitude Classification API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """
    Endpoint untuk cek status API dan model
    """
    try:
        model_loaded = model is not None
        le_target_loaded = le_target is not None
        le_remark_loaded = le_remark is not None
        
        status = "healthy" if all([model_loaded, le_target_loaded, le_remark_loaded]) else "unhealthy"
        
        return {
            "status": status,
            "model_loaded": model_loaded,
            "le_target_loaded": le_target_loaded,
            "le_remark_loaded": le_remark_loaded,
            "target_classes": le_target.classes_.tolist() if le_target_loaded else [],
            "num_remark_classes": len(le_remark.classes_) if le_remark_loaded else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.post("/predict", response_model=PredictionResponse)
async def predict_magnitude(data: EarthquakeInput):
    """
    Endpoint untuk prediksi klasifikasi magnitude gempa
    
    Input:
        - lat: Latitude gempa
        - lon: Longitude gempa
        - depth: Kedalaman gempa (km)
        - datetime: Tanggal dan waktu gempa (format: YYYY-MM-DD HH:MM:SS)
        - remark: Wilayah/lokasi gempa
    
    Output:
        - predicted_class: Kelas magnitude yang diprediksi (kecil/sedang/besar)
        - confidence: Probabilitas untuk setiap kelas
        - dist_km: Jarak ke Anak Krakatau (km)
        - input_data: Data input yang diterima
    """
    try:
        # Validasi model sudah dimuat
        if model is None or le_target is None or le_remark is None:
            raise HTTPException(status_code=500, detail="Model belum dimuat dengan benar")
        
        # 1. Hitung jarak ke Anak Krakatau
        dist_km = haversine(data.lat, data.lon, KRAKATAU_LAT, KRAKATAU_LON)
        
        # 2. Extract month dan dayofweek dari datetime
        try:
            dt = datetime.strptime(data.datetime, "%Y-%m-%d %H:%M:%S")
            month = dt.month
            dayofweek = dt.weekday()  # 0 = Monday, 6 = Sunday
        except ValueError as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Format datetime tidak valid. Gunakan format: YYYY-MM-DD HH:MM:SS. Error: {str(e)}"
            )
        
        # 3. Encode remark dengan fallback untuk unseen labels
        try:
            # Cek apakah remark ada dalam classes yang dikenal
            if data.remark in le_remark.classes_:
                remark_encoded = le_remark.transform([data.remark])[0]
            else:
                # Fallback: gunakan encoding default (misal: encoding pertama atau -1)
                print(f"⚠ Warning: Remark '{data.remark}' tidak dikenal. Menggunakan fallback encoding.")
                remark_encoded = 0  # Atau bisa menggunakan nilai lain sebagai default
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error saat encoding remark: {str(e)}"
            )
        
        # 4. Susun fitur dalam urutan yang benar
        # Urutan: ['lat', 'lon', 'depth', 'dist_km', 'month', 'dayofweek', 'remark_encoded']
        features = np.array([[
            data.lat,
            data.lon,
            data.depth,
            dist_km,
            month,
            dayofweek,
            remark_encoded
        ]])
        
        # 5. Prediksi
        prediction = model.predict(features)
        prediction_proba = model.predict_proba(features)
        
        # 6. Inverse transform hasil prediksi
        predicted_class = le_target.inverse_transform(prediction)[0]
        
        # 7. Buat dictionary confidence untuk setiap kelas
        confidence_dict = {}
        for idx, class_name in enumerate(le_target.classes_):
            confidence_dict[class_name] = float(prediction_proba[0][idx])
        
        # 8. Response
        return PredictionResponse(
            predicted_class=predicted_class,
            confidence=confidence_dict,
            dist_km=round(dist_km, 2),
            input_data={
                "lat": data.lat,
                "lon": data.lon,
                "depth": data.depth,
                "datetime": data.datetime,
                "remark": data.remark,
                "extracted_month": month,
                "extracted_dayofweek": dayofweek,
                "remark_encoded": int(remark_encoded)
            }
        )
        
    except HTTPException:
        # Re-raise HTTPException yang sudah dibuat
        raise
    except Exception as e:
        # Tangkap error lain yang tidak terduga
        raise HTTPException(
            status_code=500,
            detail=f"Error saat melakukan prediksi: {str(e)}"
        )


@app.get("/earthquakes")
async def get_earthquakes():
    """
    Endpoint untuk mengambil data gempa dalam radius 150km dari Anak Krakatau.
    Data ini digunakan untuk visualisasi heatmap di frontend.
    
    Returns:
        Dictionary berisi list data gempa dengan field: lat, lon, mag, depth, datetime, remark
    """
    try:
        # Generate sample earthquake data dalam radius 150km dari Anak Krakatau
        np.random.seed(42)  # Untuk konsistensi data
        
        num_samples = 100  # Jumlah titik data
        earthquakes_data = []
        
        # Lokasi contoh wilayah sekitar Anak Krakatau
        remarks = [
            "Selat Sunda", "Krakatau", "Lampung Selatan", "Banten", 
            "Ujung Kulon", "Pandeglang", "Serang", "Anyer",
            "Labuan", "Carita", "Cilegon"
        ]
        
        for i in range(num_samples):
            # Generate koordinat random dalam radius ~150km dari Anak Krakatau
            # Konversi kasar: 1 derajat ≈ 111km
            # 150km ≈ 1.35 derajat
            angle = np.random.uniform(0, 2 * np.pi)
            radius_deg = np.random.uniform(0, 1.35)  # Radius dalam derajat
            
            # Hitung offset dari Anak Krakatau
            lat_offset = radius_deg * np.cos(angle)
            lon_offset = radius_deg * np.sin(angle)
            
            lat = KRAKATAU_LAT + lat_offset
            lon = KRAKATAU_LON + lon_offset
            
            # Generate magnitude (distribusi lebih banyak ke kecil-sedang)
            mag = np.random.choice(
                [
                    np.random.uniform(2.5, 4.0),  # kecil
                    np.random.uniform(4.0, 6.0),  # sedang
                    np.random.uniform(6.0, 7.5)   # besar
                ],
                p=[0.7, 0.25, 0.05]  # Probabilitas: 70% kecil, 25% sedang, 5% besar
            )
            
            # Generate depth (kebanyakan dangkal-menengah)
            depth = np.random.choice(
                [
                    np.random.uniform(1, 20),     # dangkal
                    np.random.uniform(20, 70),    # menengah
                    np.random.uniform(70, 200)    # dalam
                ],
                p=[0.6, 0.3, 0.1]  # 60% dangkal, 30% menengah, 10% dalam
            )
            
            # Generate datetime dalam range 2023-2024
            year = np.random.choice([2023, 2024], p=[0.4, 0.6])
            month = np.random.randint(1, 13)
            day = np.random.randint(1, 29)  # Aman untuk semua bulan
            hour = np.random.randint(0, 24)
            minute = np.random.randint(0, 60)
            second = np.random.randint(0, 60)
            
            dt_str = f"{year}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d}"
            
            # Pilih remark random
            remark = np.random.choice(remarks)
            
            earthquakes_data.append({
                "lat": round(float(lat), 4),
                "lon": round(float(lon), 4),
                "mag": round(float(mag), 2),
                "depth": round(float(depth), 2),
                "datetime": dt_str,
                "remark": remark
            })
        
        # Tambahkan beberapa event signifikan di lokasi Anak Krakatau
        significant_events = [
            {
                "lat": -6.102,
                "lon": 105.423,
                "mag": 6.8,
                "depth": 5.0,
                "datetime": "2024-06-15 14:23:10",
                "remark": "Krakatau"
            },
            {
                "lat": -6.105,
                "lon": 105.420,
                "mag": 5.2,
                "depth": 8.5,
                "datetime": "2024-05-20 08:15:33",
                "remark": "Krakatau"
            },
            {
                "lat": -6.100,
                "lon": 105.425,
                "mag": 4.8,
                "depth": 12.0,
                "datetime": "2024-04-10 22:45:18",
                "remark": "Krakatau"
            }
        ]
        
        earthquakes_data.extend(significant_events)
        
        return {
            "data": earthquakes_data,
            "total": len(earthquakes_data),
            "radius_km": 150,
            "center": {
                "lat": KRAKATAU_LAT,
                "lon": KRAKATAU_LON,
                "name": "Anak Krakatau"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saat mengambil data gempa: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000, reload=True)
