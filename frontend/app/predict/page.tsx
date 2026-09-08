'use client';

import { useState, useRef } from 'react';
import { predictMagnitude } from '@/lib/api';
import type { PredictionResponse } from '@/types/earthquake';
import { AlertCircle, CheckCircle, TrendingUp, MapPin, Calendar } from 'lucide-react';

export default function PredictPage() {
  const [formData, setFormData] = useState({
    lat: '',
    lon: '',
    depth: '',
    datetime: '',
    remark: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [datetimeText, setDatetimeText] = useState('');
  const calendarRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Convert datetime-local value ("YYYY-MM-DDTHH:MM") to backend format ("YYYY-MM-DD HH:MM:SS")
  const pickerToText = (pickerVal: string): string => {
    if (!pickerVal) return '';
    return pickerVal.replace('T', ' ') + ':00';
  };

  // Convert backend format ("YYYY-MM-DD HH:MM:SS") to datetime-local value ("YYYY-MM-DDTHH:MM")
  const textToPicker = (text: string): string => {
    const match = text.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/);
    return match ? `${match[1]}T${match[2]}` : '';
  };

  const handleDatetimeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDatetimeText(val);
    setFormData((prev) => ({ ...prev, datetime: val }));
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = pickerToText(e.target.value);
    setDatetimeText(formatted);
    setFormData((prev) => ({ ...prev, datetime: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictMagnitude({
        lat: parseFloat(formData.lat),
        lon: parseFloat(formData.lon),
        depth: parseFloat(formData.depth),
        datetime: formData.datetime,
        remark: formData.remark,
      });

      setResult(response);
    } catch (err: any) {
      console.error('Error predicting:', err);
      setError(
        err.response?.data?.detail || 
        'Gagal melakukan prediksi. Pastikan backend running dan data valid.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getMagnitudeColor = (magnitude: string) => {
    switch (magnitude) {
      case 'kecil':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sedang':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'besar':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressBarColor = (magnitude: string) => {
    switch (magnitude) {
      case 'kecil':
        return 'bg-green-500';
      case 'sedang':
        return 'bg-orange-500';
      case 'besar':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Prediksi Manual Magnitude Gempa
        </h1>
        <p className="text-gray-600">
          Masukkan data gempa untuk mendapatkan prediksi klasifikasi magnitude
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Input Data Gempa</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                name="lat"
                step="any"
                value={formData.lat}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="-6.15"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                name="lon"
                step="any"
                value={formData.lon}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="105.40"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kedalaman (km)
              </label>
              <input
                type="number"
                name="depth"
                step="any"
                value={formData.depth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="10.5"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal & Waktu
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="datetime"
                  value={datetimeText}
                  onChange={handleDatetimeTextChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent font-mono text-sm"
                  placeholder="YYYY-MM-DD HH:MM:SS"
                  required
                />
                <button
                  type="button"
                  onClick={() => calendarRef.current?.showPicker()}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-navy transition-colors flex-shrink-0"
                  title="Pilih dari kalender"
                >
                  <Calendar size={18} />
                </button>
                <input
                  ref={calendarRef}
                  type="datetime-local"
                  value={textToPicker(datetimeText)}
                  onChange={handleCalendarChange}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ketik manual (YYYY-MM-DD HH:MM:SS) atau klik ikon kalender
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wilayah/Remark
              </label>
              <input
                type="text"
                name="remark"
                value={formData.remark}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                placeholder="Selat Sunda"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 px-6 rounded-lg font-semibold text-white
                transition-colors duration-200
                ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-navy hover:bg-navy/90'
                }
              `}
            >
              {loading ? 'Memprediksi...' : 'Prediksi Magnitude'}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hasil Prediksi</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
              <p>Hasil prediksi akan muncul di sini</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* Predicted Class Badge */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Kelas Magnitude Diprediksi</p>
                <div
                  className={`
                    inline-block px-8 py-4 rounded-xl border-2 font-bold text-2xl uppercase
                    ${getMagnitudeColor(result.predicted_class)}
                  `}
                >
                  {result.predicted_class}
                </div>
              </div>

              {/* Confidence Scores */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Confidence Score per Kelas
                </p>
                <div className="space-y-3">
                  {Object.entries(result.confidence).map(([className, confidence]) => {
                    const percentage = (confidence * 100).toFixed(1);
                    return (
                      <div key={className}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium capitalize">{className}</span>
                          <span className="text-gray-600">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor(
                              className
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distance Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <MapPin className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Jarak ke Anak Krakatau
                  </p>
                  <p className="text-lg font-bold text-blue-700">{result.dist_km} km</p>
                </div>
              </div>

              {/* Input Data Summary */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Data Input
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Koordinat:</span>
                    <p className="font-medium">
                      {result.input_data.lat}, {result.input_data.lon}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kedalaman:</span>
                    <p className="font-medium">{result.input_data.depth} km</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Waktu:</span>
                    <p className="font-medium">{result.input_data.datetime}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Wilayah:</span>
                    <p className="font-medium">{result.input_data.remark}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
