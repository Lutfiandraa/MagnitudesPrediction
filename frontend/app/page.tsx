'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import StatsCard from '@/components/StatsCard';
import { Database, MapPin, Activity, CheckCircle } from 'lucide-react';
import { getHealth } from '@/lib/api';
import type { HealthResponse } from '@/types/earthquake';

// Dynamic import MapView karena leaflet perlu window/document (client-side only)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getHealth();
        setHealth(data);
      } catch (err) {
        console.error('Error fetching health status:', err);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dashboard Prediksi Gempa Anak Krakatau
        </h1>
        <p className="text-gray-600">
          Sistem klasifikasi magnitude gempa menggunakan machine learning XGBoost
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Titik Data"
          value="103"
          icon={Database}
          iconColor="text-blue-500"
          subtitle="Data gempa tersimpan"
        />
        <StatsCard
          title="Radius Area"
          value="150 km"
          icon={MapPin}
          iconColor="text-green-500"
          subtitle="Dari Anak Krakatau"
        />
        <StatsCard
          title="Jumlah Wilayah"
          value={healthLoading ? '...' : health?.num_remark_classes || '-'}
          icon={Activity}
          iconColor="text-purple-500"
          subtitle="Remark unik"
        />
        <StatsCard
          title="Status API"
          value={healthLoading ? '...' : health?.status === 'healthy' ? 'Online' : 'Offline'}
          icon={CheckCircle}
          iconColor={
            healthLoading
              ? 'text-gray-400'
              : health?.status === 'healthy'
              ? 'text-green-500'
              : 'text-red-500'
          }
          subtitle={healthLoading ? 'Mengecek...' : 'Backend server'}
        />
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Peta Heatmap Gempa
          </h2>
          <p className="text-gray-600">
            Visualisasi intensitas gempa di sekitar Anak Krakatau dalam radius 150km
          </p>
        </div>
        
        <MapView />

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Info:</span> Peta menggunakan CartoDB Dark Matter tile dengan heatmap layer. 
            Warna lebih terang menunjukkan aktivitas gempa yang lebih intens. 
            Marker merah menandakan lokasi Anak Krakatau.
          </p>
        </div>
      </div>
    </div>
  );
}
