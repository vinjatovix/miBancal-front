import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import L from 'leaflet';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LocationFormFields from '../../../../../src/pages/settings/locations/components/LocationFormFields/LocationFormFields';
import type { LocationFormValues } from '../../../../../src/pages/settings/locations/utils/validateLocationForm';
import * as geocodingService from '../../../../../src/services/geocoding.service';

const EMPTY_VALUES: LocationFormValues = {
  name: '',
  latitude: '',
  longitude: ''
};

describe('LocationFormFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza todos los campos del formulario con sus etiquetas', () => {
    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Buscar municipio o lugar')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Latitud')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitud')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Usar mi ubicación actual' })
    ).toBeInTheDocument();
  });

  it('notifica cambios en el campo nombre', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={handleChange}
      />
    );

    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Mi huerto');

    expect(handleChange).toHaveBeenCalledWith('name', 'M');
  });

  it('notifica cambios en los campos de latitud y longitud', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={handleChange}
      />
    );

    const latInput = screen.getByLabelText('Latitud');
    await user.type(latInput, '40.4');

    expect(handleChange).toHaveBeenCalledWith('latitude', '4');
  });

  it('renderiza mensajes de error accesibles con role alert', () => {
    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{
          name: 'name_required',
          latitude: 'latitude_required',
          longitude: 'longitude_invalid'
        }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('La latitud es obligatoria.')).toBeInTheDocument();
    expect(
      screen.getByText('La longitud debe ser un número entre -180 y 180.')
    ).toBeInTheDocument();
  });

  it('deshabilita los inputs cuando disabled es verdadero', () => {
    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        disabled={true}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Nombre')).toBeDisabled();
    expect(screen.getByLabelText('Latitud')).toBeDisabled();
    expect(screen.getByLabelText('Longitud')).toBeDisabled();
  });

  it('actualiza coordenadas cuando se interactúa con el mapa', () => {
    const handleChange = vi.fn();

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={handleChange}
      />
    );

    const mapInstance = vi.mocked(L.map).mock.results[0]?.value as {
      _trigger: (event: string, data: unknown) => void;
    };
    mapInstance._trigger('click', {
      latlng: { lat: 37.3891, lng: -5.9845 }
    });

    expect(handleChange).toHaveBeenCalledWith('latitude', '37.3891');
    expect(handleChange).toHaveBeenCalledWith('longitude', '-5.9845');
  });

  it('obtiene coordenadas mediante geolocalización cuando el usuario lo solicita', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const getCurrentPosition = vi.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 37.4712,
          longitude: -5.6421
        }
      });
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: { getCurrentPosition }
    });

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={handleChange}
      />
    );

    const geoBtn = screen.getByRole('button', {
      name: 'Usar mi ubicación actual'
    });
    await user.click(geoBtn);

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('latitude', '37.4712');
    expect(handleChange).toHaveBeenCalledWith('longitude', '-5.6421');
  });

  it('muestra mensaje de error cuando falla la geolocalización', async () => {
    const user = userEvent.setup();
    const getCurrentPosition = vi.fn().mockImplementation((_success, error) => {
      error(new Error('Permission denied'));
    });
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: { getCurrentPosition }
    });

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={vi.fn()}
      />
    );

    const geoBtn = screen.getByRole('button', {
      name: 'Usar mi ubicación actual'
    });
    await user.click(geoBtn);

    expect(
      screen.getByText('No se ha podido obtener tu ubicación actual.')
    ).toBeInTheDocument();
  });

  it('muestra aviso cuando el navegador no soporta geolocalización', async () => {
    const user = userEvent.setup();
    const navWithoutGeo = { ...navigator };
    Reflect.deleteProperty(navWithoutGeo, 'geolocation');
    vi.stubGlobal('navigator', navWithoutGeo);

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={vi.fn()}
      />
    );

    const geoBtn = screen.getByRole('button', {
      name: 'Usar mi ubicación actual'
    });
    await user.click(geoBtn);

    expect(
      screen.getByText('Tu navegador no admite geolocalización.')
    ).toBeInTheDocument();
  });

  it('busca lugares y asigna coordenadas al seleccionar un resultado', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    vi.spyOn(geocodingService, 'searchPlaces').mockResolvedValue([
      {
        id: 1,
        name: 'Carmona',
        latitude: 37.4712,
        longitude: -5.6421,
        country: 'España',
        admin1: 'Andalucía'
      }
    ]);

    render(
      <LocationFormFields
        values={EMPTY_VALUES}
        errors={{}}
        onChange={handleChange}
      />
    );

    const searchInput = screen.getByLabelText('Buscar municipio o lugar');
    await user.type(searchInput, 'Carmona');
    const searchBtn = screen.getByRole('button', { name: 'Buscar' });
    await user.click(searchBtn);

    const placeBtn = await screen.findByRole('button', {
      name: 'Carmona, Andalucía, España'
    });
    await user.click(placeBtn);

    expect(handleChange).toHaveBeenCalledWith('latitude', '37.4712');
    expect(handleChange).toHaveBeenCalledWith('longitude', '-5.6421');
    expect(handleChange).toHaveBeenCalledWith('name', 'Carmona');
  });
});
