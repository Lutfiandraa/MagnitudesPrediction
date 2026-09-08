export interface EarthquakeData {
  lat: number;
  lon: number;
  mag: number;
  depth: number;
  datetime: string;
  remark: string;
}

export interface EarthquakeResponse {
  data: EarthquakeData[];
  total: number;
  radius_km: number;
  center: {
    lat: number;
    lon: number;
    name: string;
  };
}

export interface PredictionInput {
  lat: number;
  lon: number;
  depth: number;
  datetime: string;
  remark: string;
}

export interface PredictionResponse {
  predicted_class: string;
  confidence: {
    besar: number;
    kecil: number;
    sedang: number;
  };
  dist_km: number;
  input_data: {
    lat: number;
    lon: number;
    depth: number;
    datetime: string;
    remark: string;
    extracted_month: number;
    extracted_dayofweek: number;
    remark_encoded: number;
  };
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  le_target_loaded: boolean;
  le_remark_loaded: boolean;
  target_classes: string[];
  num_remark_classes: number;
}
