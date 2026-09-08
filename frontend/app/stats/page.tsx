import { BarChart3 } from 'lucide-react';

export default function StatsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-4">
          <BarChart3 size={36} className="text-navy" />
          <h1 className="text-4xl font-bold text-gray-900">Statistik</h1>
        </div>
        <p className="text-gray-600">
          Halaman statistik untuk visualisasi data dan analisis model
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <p className="text-gray-500 text-center py-12">
          Halaman ini sedang dalam pengembangan
        </p>
        <p className="text-sm text-gray-400 text-center">
          Akan menampilkan grafik distribusi magnitude, analisis temporal, dan metrik performa model
        </p>
      </div>
    </div>
  );
}
