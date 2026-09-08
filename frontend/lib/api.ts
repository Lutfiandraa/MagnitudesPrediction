import axios from 'axios';
import type { EarthquakeResponse, PredictionInput, PredictionResponse, HealthResponse } from '@/types/earthquake';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};

export const getEarthquakes = async (): Promise<EarthquakeResponse> => {
  const response = await api.get<EarthquakeResponse>('/earthquakes');
  return response.data;
};

export const predictMagnitude = async (data: PredictionInput): Promise<PredictionResponse> => {
  const response = await api.post<PredictionResponse>('/predict', data);
  return response.data;
};
