'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { EarthquakeData } from '@/types/earthquake';

// Declare leaflet.heat types
declare global {
  interface L {
    heatLayer(latlngs: [number, number, number][], options?: any): any;
  }
}

interface HeatmapLayerProps {
  data: EarthquakeData[];
}

export default function HeatmapLayer({ data }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined' || !data || data.length === 0) return;

    // Dynamically import leaflet.heat
    import('leaflet.heat').then((HeatLayer) => {
      // Format data untuk heatmap: [lat, lon, magnitude]
      const heatData: [number, number, number][] = data.map((eq) => [
        eq.lat,
        eq.lon,
        eq.mag,
      ]);

      // Create heat layer dengan parameter yang sama seperti folium
      const heat = (window.L as any).heatLayer(heatData, {
        radius: 15,
        blur: 20,
        maxZoom: 10,
        max: 1.0,
        minOpacity: 0.5,
      });

      // Add to map
      heat.addTo(map);

      // Cleanup function
      return () => {
        map.removeLayer(heat);
      };
    });
  }, [data, map]);

  return null;
}
