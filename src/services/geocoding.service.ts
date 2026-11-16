import { externalFetch } from './api';

export interface GeocodingPlace {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country?: string;
  readonly admin1?: string;
}

interface OpenMeteoGeocodingResponse {
  readonly results?: readonly {
    readonly id: number;
    readonly name: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly country?: string;
    readonly admin1?: string;
  }[];
}

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export async function searchPlaces(
  query: string,
  signal?: AbortSignal
): Promise<readonly GeocodingPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=es&format=json`;
  const response = await externalFetch<OpenMeteoGeocodingResponse>(url, {
    signal
  });

  if (!response?.results) {
    return [];
  }

  return response.results.map((item) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    admin1: item.admin1
  }));
}
