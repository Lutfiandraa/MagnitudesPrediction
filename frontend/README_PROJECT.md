# Frontend MagnitudeAI - Next.js

Frontend web application untuk sistem prediksi dan visualisasi gempa di sekitar Anak Krakatau menggunakan Next.js, TypeScript, dan TailwindCSS.

## 🎨 Tech Stack

- **Framework**: Next.js 16.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + Custom CSS
- **UI Components**: Lucide React (Icons)
- **Maps**: React-Leaflet + Leaflet.heat (Heatmap)
- **HTTP Client**: Axios
- **Font**: Google Fonts Poppins (300, 400, 500, 600, 700)

## 📁 Struktur Folder

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout dengan Sidebar
│   ├── page.tsx                 # Dashboard utama (/)
│   ├── globals.css              # Global styles & Tailwind config
│   ├── predict/
│   │   └── page.tsx            # Halaman prediksi manual
│   ├── stats/
│   │   └── page.tsx            # Halaman statistik (placeholder)
│   └── about/
│       └── page.tsx            # Halaman tentang model
│
├── components/                  # React components
│   ├── Sidebar.tsx             # Sidebar navigasi vertikal
│   ├── MapView.tsx             # Peta Leaflet dengan heatmap
│   ├── HeatmapLayer.tsx        # Layer heatmap custom
│   └── StatsCard.tsx           # Card statistik reusable
│
├── lib/                        # Utility functions
│   └── api.ts                  # API client (axios wrapper)
│
├── types/                      # TypeScript type definitions
│   └── earthquake.ts           # Interfaces untuk data gempa
│
├── public/                     # Static assets
├── node_modules/               # Dependencies
├── package.json                # Dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

## 🎯 Fitur Utama

### 1. Dashboard (/)
- **Stats Cards**: Menampilkan total data, radius area, jumlah wilayah, dan status API
- **Heatmap Interactive**: Peta interaktif dengan visualisasi intensitas gempa
- **Responsive Design**: Optimal di desktop dan mobile

### 2. Prediksi Manual (/predict)
- **Form Input**: Input lat, lon, depth, datetime, remark
- **Real-time Prediction**: Mengirim request ke backend dan menampilkan hasil
- **Confidence Score**: Progress bar untuk setiap kelas (kecil/sedang/besar)
- **Color-coded Results**: Hijau (kecil), Orange (sedang), Merah (besar)

### 3. Sidebar Navigation
- **Fixed Sidebar**: Sidebar vertikal dengan background navy (#0A1F44)
- **Active State**: Highlight menu yang sedang aktif
- **Responsive**: Collapse ke hamburger menu di mobile
- **Icons**: Menggunakan Lucide React icons

### 4. Visualisasi Peta
- **CartoDB Dark Matter**: Tile layer gelap seperti folium
- **Heatmap Layer**: Menggunakan leaflet.heat dengan parameter:
  - radius: 15
  - blur: 20
  - maxZoom: 10
- **Custom Marker**: Marker merah dengan icon bintang untuk Anak Krakatau
- **Popup**: Info koordinat Anak Krakatau (-6.102, 105.423)

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js versi 18 atau lebih tinggi
- npm atau yarn
- Backend FastAPI harus running di http://localhost:4000

### Installation

1. Masuk ke direktori frontend:
```bash
cd C:\MagnitudeAI\frontend
```

2. Install dependencies (sudah terinstall):
```bash
npm install
# atau jika ada peer dependency warning:
npm install --legacy-peer-deps
```

### Development Server

```bash
npm run dev
```

Server akan berjalan di **http://localhost:3000**

### Production Build

```bash
# Build aplikasi
npm run build

# Run production server
npm start
```

## 🔗 API Integration

Frontend berkomunikasi dengan backend FastAPI melalui file `lib/api.ts`:

### Endpoints yang Digunakan:
- `GET /health` - Cek status backend
- `GET /earthquakes` - Ambil data gempa untuk heatmap
- `POST /predict` - Prediksi magnitude gempa

### Base URL:
```typescript
const API_BASE_URL = 'http://localhost:4000';
```

## 🎨 Design System

### Colors (Tailwind Custom)
- **Navy**: `#0A1F44` - Background sidebar dan primary actions
- **Broken White**: `#FAFAF7` - Background konten utama
- **Background**: `#F5F5F0` - Background body

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### Component Styling
- **Cards**: White background, subtle shadow, rounded corners
- **Sidebar**: Navy background, white text, hover effects
- **Buttons**: Navy primary, hover effects, loading states
- **Form Inputs**: Border focus dengan ring navy

## 🗺️ Leaflet Integration

### Dynamic Import (SSR Fix)
MapView di-import secara dynamic dengan `ssr: false` karena Leaflet memerlukan `window` object:

```typescript
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <LoadingComponent />
});
```

### CSS Import
Leaflet CSS di-import di `app/layout.tsx`:
```typescript
import "leaflet/dist/leaflet.css";
```

### Heatmap Configuration
```typescript
const heat = L.heatLayer(heatData, {
  radius: 15,      // Sama dengan folium
  blur: 20,        // Sama dengan folium
  maxZoom: 10,     // Sama dengan folium
  max: 1.0,
  minOpacity: 0.5,
});
```

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (lg, xl)

### Sidebar Behavior
- **Desktop**: Fixed sidebar selalu terlihat (width: 288px / 18rem)
- **Mobile**: Sidebar collapse, toggle dengan hamburger button

### Main Content Margin
- **Desktop**: `ml-72` (margin-left: 18rem) untuk kompensasi sidebar
- **Mobile**: `ml-0` (full width)

## 🔧 Troubleshooting

### Port Conflict
Jika port 3000 sudah digunakan:
```bash
npm run dev -- -p 3001
```

### CORS Error
Pastikan backend sudah mengaktifkan CORS untuk `http://localhost:3000`:
```python
# Di backend main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Leaflet Not Loading
- Pastikan `leaflet` dan `react-leaflet` sudah terinstall
- Pastikan `leaflet/dist/leaflet.css` di-import di layout
- MapView harus di-import dengan `dynamic` dan `ssr: false`

### Backend Connection Failed
- Pastikan backend running di port 4000: `http://localhost:4000`
- Test dengan curl: `curl http://localhost:4000/health`
- Cek network tab di browser DevTools untuk error details

### React 19 Peer Dependency Warning
Jika muncul warning tentang React 19, install dengan:
```bash
npm install --legacy-peer-deps
```

React-leaflet belum official support React 19, tapi berjalan dengan baik menggunakan legacy peer deps.

## 📊 Data Flow

1. **User membuka Dashboard** →
2. Frontend fetch `/earthquakes` dari backend →
3. Backend return 103 titik data gempa →
4. Frontend render MapView dengan Heatmap Layer →
5. Leaflet.heat visualisasi data sebagai heatmap

**Untuk Prediksi Manual:**
1. User input data di form `/predict` →
2. Submit trigger POST `/predict` ke backend →
3. Backend jalankan model XGBoost →
4. Return predicted_class dan confidence →
5. Frontend tampilkan hasil dengan color-coded badges dan progress bars

## ⚠️ Notes

- Font Poppins di-load via Google Fonts CDN (memerlukan internet)
- Leaflet tiles (CartoDB) juga memerlukan internet connection
- Data dummy di backend (103 points) - untuk production gunakan data real
- Leaflet.heat parameter disesuaikan dengan konfigurasi folium asli
- Custom marker untuk Anak Krakatau menggunakan `divIcon` dengan inline SVG

## 🐛 Known Issues

1. React-leaflet masih menggunakan peer dependency React ^18, tapi berjalan normal di React 19 dengan `--legacy-peer-deps`
2. Leaflet.heat types tidak sempurna - menggunakan type casting di HeatmapLayer.tsx

## 📖 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [Leaflet.heat Plugin](https://github.com/Leaflet/Leaflet.heat)
- [Lucide React Icons](https://lucide.dev/)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Framework**: Next.js 16.3.4  
**Backend**: FastAPI (http://localhost:4000)
