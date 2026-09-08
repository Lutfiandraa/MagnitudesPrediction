# Backend API - Klasifikasi Magnitude Gempa Anak Krakatau

Backend API untuk klasifikasi magnitude gempa di sekitar Anak Krakatau menggunakan model XGBoost. API ini menerima data gempa (koordinat, kedalaman, waktu, wilayah) dan memprediksi klasifikasi magnitude gempa (kecil, sedang, atau besar).

## 📁 Struktur File

```
backend/
├── main.py                      # FastAPI application utama
├── xgb_magnitude_model.json     # Model XGBoost yang sudah dilatih
├── le_target.pkl                # LabelEncoder untuk target (kecil/sedang/besar)
├── le_remark.pkl                # LabelEncoder untuk kolom remark/wilayah
├── magnitudes.py                # Script training asli (untuk referensi)
├── requirements.txt             # Dependencies Python
└── README.md                    # Dokumentasi ini
```

## 🔧 Prasyarat

- **Python**: Versi 3.8 atau lebih tinggi (ditest dengan Python 3.11)
- **pip**: Package manager Python

### Dependencies Utama:
- FastAPI 0.111.0 - Web framework
- Uvicorn 0.30.0 - ASGI server
- XGBoost 2.0.3 - Machine learning library
- scikit-learn 1.5.0 - Preprocessing dan encoding
- Pandas 2.2.2 - Data manipulation
- NumPy 1.26.4 - Numerical computing
- Pydantic 2.7.1 - Data validation

## 📦 Instalasi

### 1. Clone atau masuk ke direktori backend
```bash
cd C:\MagnitudeAI\backend
```

### 2. (Opsional tapi direkomendasikan) Buat virtual environment
```bash
# Membuat virtual environment
python -m venv venv

# Aktivasi di Windows
venv\Scripts\activate

# Aktivasi di Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

## 🚀 Cara Menjalankan Server

### Menjalankan server development dengan auto-reload:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 4000
```

atau jika uvicorn sudah ada di PATH:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 4000
```

### Menjalankan server production (tanpa auto-reload):
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 4000
```

Server akan berjalan di: **http://localhost:4000**

## 📡 Endpoints API

### 1. Root Endpoint
**GET** `/`

Menampilkan informasi API dan daftar endpoints yang tersedia.

**Response:**
```json
{
  "message": "Earthquake Magnitude Classification API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "predict": "/predict",
    "docs": "/docs"
  }
}
```

### 2. Health Check
**GET** `/health`

Memeriksa status API dan memastikan model sudah dimuat dengan benar.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "le_target_loaded": true,
  "le_remark_loaded": true,
  "target_classes": ["besar", "kecil", "sedang"],
  "num_remark_classes": 51
}
```

### 3. Prediksi Magnitude
**POST** `/predict`

Memprediksi klasifikasi magnitude gempa berdasarkan data input.

**Request Body:**
```json
{
  "lat": -6.15,
  "lon": 105.40,
  "depth": 10.5,
  "datetime": "2024-01-15 08:30:45",
  "remark": "Selat Sunda"
}
```

**Parameter:**
- `lat` (float): Latitude gempa (-90 sampai 90)
- `lon` (float): Longitude gempa (-180 sampai 180)
- `depth` (float): Kedalaman gempa dalam kilometer (≥ 0)
- `datetime` (string): Tanggal dan waktu gempa (format: `YYYY-MM-DD HH:MM:SS`)
- `remark` (string): Nama wilayah/lokasi gempa

**Response:**
```json
{
  "predicted_class": "kecil",
  "confidence": {
    "besar": 0.0013,
    "kecil": 0.5951,
    "sedang": 0.4036
  },
  "dist_km": 6.87,
  "input_data": {
    "lat": -6.15,
    "lon": 105.4,
    "depth": 10.5,
    "datetime": "2024-01-15 08:30:45",
    "remark": "Selat Sunda",
    "extracted_month": 1,
    "extracted_dayofweek": 0,
    "remark_encoded": 0
  }
}
```

**Penjelasan Response:**
- `predicted_class`: Kelas magnitude yang diprediksi (kecil/sedang/besar)
- `confidence`: Probabilitas/confidence score untuk setiap kelas
- `dist_km`: Jarak dari lokasi gempa ke Anak Krakatau (koordinat: -6.102, 105.423)
- `input_data`: Data input yang diterima dan hasil ekstraksi fitur

## 🧪 Contoh Request

### Menggunakan cURL (Windows CMD/Bash):
```bash
curl -X POST "http://localhost:4000/predict" \
  -H "Content-Type: application/json" \
  -d "{\"lat\": -6.15, \"lon\": 105.40, \"depth\": 10.5, \"datetime\": \"2024-01-15 08:30:45\", \"remark\": \"Selat Sunda\"}"
```

### Menggunakan PowerShell:
```powershell
$body = @{
    lat = -6.15
    lon = 105.40
    depth = 10.5
    datetime = "2024-01-15 08:30:45"
    remark = "Selat Sunda"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/predict" -Method Post -Body $body -ContentType "application/json"
```

### Menggunakan Python:
```python
import requests

data = {
    "lat": -6.15,
    "lon": 105.40,
    "depth": 10.5,
    "datetime": "2024-01-15 08:30:45",
    "remark": "Selat Sunda"
}

response = requests.post("http://localhost:4000/predict", json=data)
print(response.json())
```

### Menggunakan JavaScript (fetch):
```javascript
const data = {
  lat: -6.15,
  lon: 105.40,
  depth: 10.5,
  datetime: "2024-01-15 08:30:45",
  remark: "Selat Sunda"
};

fetch("http://localhost:4000/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error("Error:", error));
```

## 📚 Dokumentasi Interaktif

FastAPI menyediakan dokumentasi interaktif otomatis yang dapat diakses di:

- **Swagger UI**: http://localhost:4000/docs
- **ReDoc**: http://localhost:4000/redoc

Di halaman dokumentasi, Anda dapat:
- Melihat semua endpoints yang tersedia
- Membaca deskripsi dan parameter untuk setiap endpoint
- Mencoba endpoint langsung dari browser (Try it out)
- Melihat contoh request dan response

## 🔍 Fitur Teknis

### 1. Haversine Distance Calculation
API menghitung jarak geografis antara lokasi gempa dengan Anak Krakatau menggunakan formula Haversine untuk mendapatkan jarak dalam kilometer.

**Koordinat Anak Krakatau:**
- Latitude: -6.102
- Longitude: 105.423

### 2. Feature Extraction
Dari input yang diterima, API mengekstrak fitur-fitur berikut untuk prediksi:
- `lat`: Latitude gempa
- `lon`: Longitude gempa
- `depth`: Kedalaman gempa
- `dist_km`: Jarak ke Anak Krakatau (dihitung)
- `month`: Bulan dari datetime (1-12)
- `dayofweek`: Hari dalam minggu (0=Senin, 6=Minggu)
- `remark_encoded`: Encoding numerik dari nama wilayah

### 3. Error Handling
- **Validasi Input**: Menggunakan Pydantic untuk validasi tipe data dan range
- **Unseen Labels**: Jika wilayah (remark) tidak dikenal, sistem menggunakan fallback encoding (0) tanpa crash
- **Format DateTime**: Validasi format datetime dan memberikan error message yang jelas jika format salah
- **Model Loading**: Cek status model saat startup dan endpoint health

### 4. CORS Support
API sudah dikonfigurasi dengan CORS middleware yang memungkinkan akses dari frontend di domain berbeda (development mode: allow all origins).

## ⚠️ Catatan & Disclaimer

1. **Untuk Keperluan Edukasi/Riset**: Model dan API ini dibuat untuk tujuan pembelajaran dan riset, **BUKAN** sistem peringatan dini resmi.

2. **Bukan Pengganti Sistem Resmi**: Untuk informasi gempa resmi dan akurat, selalu rujuk ke:
   - BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
   - PVMBG (Pusat Vulkanologi dan Mitigasi Bencana Geologi)

3. **Akurasi Model**: Akurasi prediksi tergantung pada kualitas data training dan tidak menjamin kebenaran 100%.

4. **Unseen Labels**: Jika nama wilayah (remark) yang diinput tidak ada dalam data training, sistem akan menggunakan fallback encoding. Hal ini mungkin mempengaruhi akurasi prediksi.

5. **Development Mode**: Konfigurasi CORS saat ini mengizinkan semua origins (`allow_origins=["*"]`). Untuk production, sebaiknya dibatasi ke domain frontend yang spesifik.

6. **Model Version Warning**: Mungkin muncul warning tentang perbedaan versi scikit-learn saat loading LabelEncoder. Ini normal jika model dilatih dengan versi yang berbeda, namun sebaiknya diperhatikan untuk konsistensi.

## 🛠️ Troubleshooting

### Server tidak bisa dijalankan
- Pastikan semua dependencies sudah terinstall: `pip install -r requirements.txt`
- Cek apakah port 4000 sudah digunakan aplikasi lain
- Gunakan `python -m uvicorn` jika perintah `uvicorn` tidak ditemukan

### Error saat loading model
- Pastikan file `xgb_magnitude_model.json`, `le_target.pkl`, dan `le_remark.pkl` ada di direktori yang sama dengan `main.py`
- Cek permission file apakah bisa dibaca

### Prediksi error
- Pastikan format datetime sesuai: `YYYY-MM-DD HH:MM:SS`
- Pastikan nilai lat, lon, depth dalam range yang valid
- Cek endpoint `/health` untuk memastikan model sudah dimuat

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue atau hubungi tim developer.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Framework**: FastAPI  
**Model**: XGBoost 2.0.3
