import { Info, AlertTriangle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-4 mb-4">
          <Info size={36} className="text-navy" />
          <h1 className="text-4xl font-bold text-gray-900">Tentang Model</h1>
        </div>
        <p className="text-gray-600">
          Informasi tentang model machine learning dan disclaimer penggunaan
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Model Klasifikasi Magnitude Gempa
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Sistem ini menggunakan algoritma <strong>XGBoost (Extreme Gradient Boosting)</strong> untuk 
            mengklasifikasikan magnitude gempa di sekitar Anak Krakatau ke dalam tiga kategori:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-700">
            <li><strong className="text-green-600">Kecil</strong>: Magnitude 0-4</li>
            <li><strong className="text-orange-600">Sedang</strong>: Magnitude 4-6</li>
            <li><strong className="text-red-600">Besar</strong>: Magnitude 6-9</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Fitur yang Digunakan</h3>
          <p className="text-gray-700 leading-relaxed">
            Model dilatih menggunakan fitur-fitur berikut:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
            <li>Latitude dan Longitude gempa</li>
            <li>Kedalaman gempa (depth)</li>
            <li>Jarak ke Anak Krakatau (calculated via Haversine)</li>
            <li>Bulan kejadian (month)</li>
            <li>Hari dalam minggu (dayofweek)</li>
            <li>Wilayah gempa (remark - encoded)</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Performa Model</h3>
          <p className="text-gray-700 leading-relaxed">
            Model telah dilatih dengan data historis gempa Indonesia dan menggunakan teknik 
            <em> sample weighting</em> untuk mengatasi ketidakseimbangan kelas. Evaluasi dilakukan 
            menggunakan metrik F1-score, confusion matrix, dan ROC-AUC per kelas.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle size={32} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Disclaimer Penting
            </h2>
            <div className="space-y-3 text-gray-800">
              <p>
                <strong>Model dan sistem ini dibuat untuk keperluan EDUKASI dan RISET saja.</strong>
              </p>
              <p>
                Sistem ini <strong>BUKAN</strong> merupakan sistem peringatan dini resmi dan 
                <strong> TIDAK BOLEH</strong> digunakan sebagai dasar pengambilan keputusan terkait keselamatan.
              </p>
              <p>
                Untuk informasi gempa yang akurat dan terpercaya, selalu rujuk ke sumber resmi:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>BMKG</strong> (Badan Meteorologi, Klimatologi, dan Geofisika) - 
                  <a href="https://www.bmkg.go.id" className="text-blue-600 hover:underline ml-1">
                    www.bmkg.go.id
                  </a>
                </li>
                <li>
                  <strong>PVMBG</strong> (Pusat Vulkanologi dan Mitigasi Bencana Geologi) - 
                  <a href="https://vsi.esdm.go.id" className="text-blue-600 hover:underline ml-1">
                    vsi.esdm.go.id
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-sm">
                Akurasi prediksi model tidak dijamin 100% dan dapat bervariasi tergantung data input.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-600">
        <p className="text-sm">
          © 2026 Magnitude Prediction • Powered by XGBoost, FastAPI, dan Next.js
        </p>
      </div>
    </div>
  );
}
