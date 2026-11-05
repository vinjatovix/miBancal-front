import { afterEach, describe, expect, it, vi } from 'vitest';

import { searchPlaces } from '../../src/services/geocoding.service';
import { lastRequest, stubFetchOk } from '../test-utils/stubFetch';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchPlaces', () => {
  it('devuelve una lista vacía sin realizar petición de red si la consulta tiene menos de 2 caracteres', async () => {
    const fetchMock = stubFetchOk({});

    const result = await searchPlaces(' a ');

    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('realiza la petición con la URL codificada en castellano y mapea los resultados', async () => {
    const mockResults = [
      {
        id: 2520118,
        name: 'Carmona',
        latitude: 37.4712,
        longitude: -5.6421,
        country: 'España',
        admin1: 'Andalucía'
      }
    ];
    const fetchMock = stubFetchOk({ results: mockResults });

    const result = await searchPlaces('Carmona');

    expect(result).toEqual([
      {
        id: 2520118,
        name: 'Carmona',
        latitude: 37.4712,
        longitude: -5.6421,
        country: 'España',
        admin1: 'Andalucía'
      }
    ]);
    const { url } = lastRequest(fetchMock);
    expect(url).toBe(
      'https://geocoding-api.open-meteo.com/v1/search?name=Carmona&count=5&language=es&format=json'
    );
  });

  it('devuelve array vacío si la API responde sin la propiedad results', async () => {
    stubFetchOk({});

    const result = await searchPlaces('LugarInexistente');

    expect(result).toEqual([]);
  });
});
