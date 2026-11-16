import { render } from '@testing-library/react';
import L from 'leaflet';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationMapPicker from '../../../../../src/pages/settings/locations/components/LocationMapPicker/LocationMapPicker';

describe('LocationMapPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa el mapa centrado en las coordenadas por defecto cuando son nulas', () => {
    render(
      <LocationMapPicker latitude={null} longitude={null} onChange={vi.fn()} />
    );

    expect(L.map).toHaveBeenCalledTimes(1);
    const mapOptions = vi.mocked(L.map).mock.calls[0]?.[1];
    expect(mapOptions?.center).toEqual([40.4168, -3.7038]);
    expect(mapOptions?.zoom).toBe(6);
    expect(L.marker).not.toHaveBeenCalled();
  });

  it('inicializa el mapa y el marcador cuando se proporcionan coordenadas', () => {
    render(
      <LocationMapPicker
        latitude={37.3891}
        longitude={-5.9845}
        onChange={vi.fn()}
      />
    );

    expect(L.map).toHaveBeenCalledTimes(1);
    const mapOptions = vi.mocked(L.map).mock.calls[0]?.[1];
    expect(mapOptions?.center).toEqual([37.3891, -5.9845]);
    expect(mapOptions?.zoom).toBe(13);
    expect(L.marker).toHaveBeenCalledWith(
      [37.3891, -5.9845],
      expect.anything()
    );
  });

  it('notifica nuevas coordenadas cuando el usuario hace clic en el mapa', () => {
    const handleChange = vi.fn();
    render(
      <LocationMapPicker
        latitude={null}
        longitude={null}
        onChange={handleChange}
      />
    );

    const mapInstance = vi.mocked(L.map).mock.results[0]?.value as {
      _trigger: (event: string, data: unknown) => void;
    };
    mapInstance._trigger('click', {
      latlng: { lat: 37.47123, lng: -5.64214 }
    });

    expect(handleChange).toHaveBeenCalledWith(37.4712, -5.6421);
  });

  it('notifica nuevas coordenadas al arrastrar el marcador', () => {
    const handleChange = vi.fn();
    render(
      <LocationMapPicker
        latitude={40.4168}
        longitude={-3.7038}
        onChange={handleChange}
      />
    );

    const markerInstance = vi.mocked(L.marker).mock.results[0]?.value as {
      setLatLng: (coords: [number, number]) => void;
      _trigger: (event: string) => void;
    };
    markerInstance.setLatLng([41.3879, 2.1699]);
    markerInstance._trigger('dragend');

    expect(handleChange).toHaveBeenCalledWith(41.3879, 2.1699);
  });

  it('actualiza la posición del marcador cuando cambian las props de latitud y longitud', () => {
    const { rerender } = render(
      <LocationMapPicker
        latitude={40.4168}
        longitude={-3.7038}
        onChange={vi.fn()}
      />
    );

    const markerInstance = vi.mocked(L.marker).mock.results[0]?.value as {
      getLatLng: () => { lat: number; lng: number };
    };

    rerender(
      <LocationMapPicker
        latitude={37.3891}
        longitude={-5.9845}
        onChange={vi.fn()}
      />
    );

    expect(markerInstance.getLatLng()).toEqual({
      lat: 37.3891,
      lng: -5.9845
    });
  });

  it('destruye la instancia del mapa al desmontar el componente', () => {
    const { unmount } = render(
      <LocationMapPicker latitude={null} longitude={null} onChange={vi.fn()} />
    );

    const mapInstance = vi.mocked(L.map).mock.results[0]?.value as {
      remove: () => void;
    };

    unmount();

    expect(mapInstance.remove).toHaveBeenCalledTimes(1);
  });
});
