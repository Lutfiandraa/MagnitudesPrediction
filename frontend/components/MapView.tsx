'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { getEarthquakes } from '@/lib/api';
import type { EarthquakeData } from '@/types/earthquake';

// Koordinat Anak Krakatau
const KRAKATAU_POSITION: [number, number] = [-6.102, 105.423];

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [earthquakeData, setEarthquakeData] = useState<EarthquakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Fetch earthquake data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getEarthquakes();

        // Diagnostic log — verifikasi struktur response mentah dari backend
        console.log('[MapView] Raw response from /earthquakes:', response);
        console.log('[MapView] response.data type:', typeof response.data);
        console.log('[MapView] response.data length:', Array.isArray(response.data) ? response.data.length : 'NOT an array');
        console.log('[MapView] First item sample:', response.data?.[0]);

        setEarthquakeData(response.data);
        setFetchError(null);
      } catch (err: any) {
        console.error('[MapView] Error fetching earthquake data:', err);

        // Bedakan jenis error
        if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
          setFetchError('network');
        } else if (err?.response?.status >= 500) {
          setFetchError('server');
        } else {
          setFetchError('unknown');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize map after loading is complete and container is in the DOM
  useEffect(() => {
    // Tunggu sampai loading selesai dan container ter-mount
    if (loading) return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // sudah pernah init, skip

    // Bersihkan stale Leaflet binding jika ada
    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    console.log('[MapView] Initializing Leaflet map...');

    const map = L.map(mapContainerRef.current, {
      center: KRAKATAU_POSITION,
      zoom: 9,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Tile layer CartoDB Dark Matter
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
      }
    );

    tileLayer.addTo(map);

    // invalidateSize setelah tile pertama load untuk fix container ukuran 0
    tileLayer.once('load', () => {
      map.invalidateSize();
      console.log('[MapView] Tile loaded, invalidateSize called');
    });

    // Panggil juga setelah delay kecil sebagai fallback
    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    // Marker Anak Krakatau
    const krakatauIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #ef4444;
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });

    L.marker(KRAKATAU_POSITION, { icon: krakatauIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center; font-weight:600;">
          <p style="color:#dc2626; font-size:1.1em;">Anak Krakatau</p>
          <p style="font-size:0.75em; color:#6b7280; margin-top:4px;">
            Koordinat: ${KRAKATAU_POSITION[0]}, ${KRAKATAU_POSITION[1]}
          </p>
        </div>
      `);

    setMapReady(true);
    console.log('[MapView] Map initialized successfully');

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        console.log('[MapView] Map destroyed on unmount');
      }
      setMapReady(false);
    };
  }, [loading]); // re-run ketika loading berubah ke false

  // Add heatmap layer after map is ready and data is available
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || earthquakeData.length === 0) return;

    let heatLayer: any = null;

    import('leaflet.heat')
      .then(() => {
        if (!mapInstanceRef.current) return;

        // Validasi format data sebelum dikirim ke heatmap
        const heatData: [number, number, number][] = earthquakeData
          .filter((eq) => {
            const valid =
              typeof eq.lat === 'number' &&
              typeof eq.lon === 'number' &&
              typeof eq.mag === 'number';
            if (!valid) {
              console.warn('[MapView] Invalid earthquake entry skipped:', eq);
            }
            return valid;
          })
          .map((eq) => [eq.lat, eq.lon, eq.mag]);

        console.log(`[MapView] Adding heatmap with ${heatData.length} points`);
        console.log('[MapView] Sample heatData[0]:', heatData[0]);

        heatLayer = (L as any).heatLayer(heatData, {
          radius: 15,
          blur: 20,
          maxZoom: 10,
          max: 1.0,
          minOpacity: 0.5,
        });

        heatLayer.addTo(mapInstanceRef.current);
        setHeatmapError(null);
        console.log('[MapView] Heatmap layer added successfully');
      })
      .catch((err) => {
        console.error('[MapView] Error loading heatmap layer:', err);
        setHeatmapError('Gagal memuat heatmap layer');
      });

    return () => {
      if (heatLayer && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(heatLayer);
        } catch (_) {}
      }
    };
  }, [mapReady, earthquakeData]);

  // Render
  return (
    <div className="w-full h-[70vh] rounded-xl overflow-hidden shadow-lg relative">

      {/* Loading overlay — di-overlay di atas container, bukan menggantikannya */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-900/80 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-sm">Memuat data peta gempa...</p>
          </div>
        </div>
      )}

      {/* Error network — graceful: tetap tampil tapi dengan banner */}
      {!loading && fetchError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          {fetchError === 'network'
            ? 'Backend tidak terjangkau — menampilkan peta dasar saja'
            : fetchError === 'server'
            ? 'Server error — data heatmap tidak tersedia'
            : 'Gagal memuat data gempa'}
        </div>
      )}

      {/* Heatmap error banner (terpisah dari fetch error) */}
      {!loading && heatmapError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-yellow-600/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          {heatmapError} — menampilkan peta dasar saja
        </div>
      )}

      {/* Container map SELALU ada di DOM agar ref selalu ter-set */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
