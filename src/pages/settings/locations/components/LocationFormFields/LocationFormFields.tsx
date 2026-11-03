import { lazy, Suspense, useId, useState } from 'react';

import { t } from '../../../../../i18n/core/t';
import {
  searchPlaces,
  type GeocodingPlace
} from '../../../../../services/geocoding.service';
import Icon from '../../../../../shared/components/Icon/Icon';
import { Loader } from '../../../../../shared/components/Loader/Loader';
import {
  parseCoordinate,
  type LocationFormErrors,
  type LocationFormValues
} from '../../utils/validateLocationForm';

import './locationFormFields.css';

const LocationMapPicker = lazy(
  () => import('../LocationMapPicker/LocationMapPicker')
);

interface Props {
  readonly values: LocationFormValues;
  readonly errors: LocationFormErrors;
  readonly disabled?: boolean;
  readonly onChange: <K extends keyof LocationFormValues>(
    field: K,
    value: LocationFormValues[K]
  ) => void;
}

function resolveErrorMessage(errorKey?: string): string | undefined {
  if (!errorKey) return undefined;
  switch (errorKey) {
    case 'name_required':
      return t('location.form.errors.name_required');
    case 'name_too_long':
      return t('location.form.errors.name_too_long');
    case 'latitude_required':
      return t('location.form.errors.latitude_required');
    case 'latitude_invalid':
      return t('location.form.errors.latitude_invalid');
    case 'longitude_required':
      return t('location.form.errors.longitude_required');
    case 'longitude_invalid':
      return t('location.form.errors.longitude_invalid');
    case 'duplicate':
    case 'duplicate_name':
      return t('location.form.duplicate_error');
    default:
      return errorKey;
  }
}

export default function LocationFormFields({
  values,
  errors,
  disabled = false,
  onChange
}: Props) {
  const nameId = useId();
  const searchId = useId();
  const latitudeId = useId();
  const longitudeId = useId();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<readonly GeocodingPlace[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const latitudeNum = parseCoordinate(values.latitude);
  const longitudeNum = parseCoordinate(values.longitude);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const places = await searchPlaces(searchQuery);
      setSearchResults(places);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: GeocodingPlace) => {
    onChange('latitude', place.latitude.toFixed(4));
    onChange('longitude', place.longitude.toFixed(4));
    if (!values.name.trim()) {
      onChange('name', place.name);
    }
    setSearchResults([]);
    setSearchQuery('');
    setHasSearched(false);
  };

  const handleGeolocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus(t('location.form.geolocation_not_supported'));
      return;
    }

    setGeoStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange('latitude', position.coords.latitude.toFixed(4));
        onChange('longitude', position.coords.longitude.toFixed(4));
      },
      () => {
        setGeoStatus(t('location.form.geolocation_error'));
      },
      { timeout: 10_000 }
    );
  };

  const handleMapChange = (lat: number, lng: number) => {
    onChange('latitude', lat.toFixed(4));
    onChange('longitude', lng.toFixed(4));
  };

  return (
    <div className="location-form-fields">
      <div className="location-form-field">
        <label htmlFor={nameId} className="location-form-field__label">
          {t('location.form.name')}
        </label>
        <input
          id={nameId}
          type="text"
          value={values.name}
          disabled={disabled}
          placeholder={t('location.form.name_placeholder')}
          className={`location-form-field__input ${
            errors.name ? 'location-form-field__input--invalid' : ''
          }`}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          onChange={(event) => onChange('name', event.target.value)}
        />
        {errors.name && (
          <span
            id={`${nameId}-error`}
            className="location-form-field__error"
            role="alert"
          >
            {resolveErrorMessage(errors.name)}
          </span>
        )}
      </div>

      <div className="location-form-fields__tools">
        <label htmlFor={searchId} className="location-form-field__label">
          {t('location.form.search_place')}
        </label>
        <div className="location-form-fields__search-bar">
          <input
            id={searchId}
            type="search"
            value={searchQuery}
            disabled={disabled || isSearching}
            placeholder={t('location.form.search_placeholder')}
            className="location-form-field__input location-form-fields__search-input"
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSearch(event);
              }
            }}
          />
          <button
            type="button"
            className="location-form-fields__btn location-form-fields__btn--search"
            disabled={disabled || isSearching || searchQuery.trim().length < 2}
            onClick={(event) => void handleSearch(event)}
          >
            <Icon name="search" decorative />
            <span>
              {isSearching
                ? t('location.form.search_loading')
                : t('location.form.search_button')}
            </span>
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul className="location-form-fields__search-results">
            {searchResults.map((place) => {
              const label = [place.name, place.admin1, place.country]
                .filter(Boolean)
                .join(', ');
              return (
                <li key={place.id}>
                  <button
                    type="button"
                    className="location-form-fields__search-item"
                    onClick={() => handleSelectPlace(place)}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {hasSearched && !isSearching && searchResults.length === 0 && (
          <p className="location-form-fields__search-status" role="status">
            {t('location.form.search_no_results')}
          </p>
        )}

        <button
          type="button"
          className="location-form-fields__btn location-form-fields__btn--geo"
          disabled={disabled}
          onClick={handleGeolocation}
        >
          <Icon name="explore" decorative />
          <span>{t('location.form.use_current_location')}</span>
        </button>

        {geoStatus && (
          <p className="location-form-fields__search-status" role="status">
            {geoStatus}
          </p>
        )}
      </div>

      <div className="location-form-fields__map-section">
        <p className="location-form-fields__map-instructions">
          {t('location.form.map_instructions')}
        </p>
        <Suspense
          fallback={
            <div className="location-form-fields__map-fallback">
              <Loader />
            </div>
          }
        >
          <LocationMapPicker
            latitude={latitudeNum}
            longitude={longitudeNum}
            onChange={handleMapChange}
          />
        </Suspense>
      </div>

      <div className="location-form-fields__coordinates-grid">
        <div className="location-form-field">
          <label htmlFor={latitudeId} className="location-form-field__label">
            {t('location.form.latitude')}
          </label>
          <input
            id={latitudeId}
            type="text"
            inputMode="decimal"
            value={values.latitude}
            disabled={disabled}
            placeholder={t('location.form.latitude_placeholder')}
            className={`location-form-field__input ${
              errors.latitude ? 'location-form-field__input--invalid' : ''
            }`}
            aria-invalid={Boolean(errors.latitude)}
            aria-describedby={
              errors.latitude ? `${latitudeId}-error` : undefined
            }
            onChange={(event) => onChange('latitude', event.target.value)}
          />
          {errors.latitude && (
            <span
              id={`${latitudeId}-error`}
              className="location-form-field__error"
              role="alert"
            >
              {resolveErrorMessage(errors.latitude)}
            </span>
          )}
        </div>

        <div className="location-form-field">
          <label htmlFor={longitudeId} className="location-form-field__label">
            {t('location.form.longitude')}
          </label>
          <input
            id={longitudeId}
            type="text"
            inputMode="decimal"
            value={values.longitude}
            disabled={disabled}
            placeholder={t('location.form.longitude_placeholder')}
            className={`location-form-field__input ${
              errors.longitude ? 'location-form-field__input--invalid' : ''
            }`}
            aria-invalid={Boolean(errors.longitude)}
            aria-describedby={
              errors.longitude ? `${longitudeId}-error` : undefined
            }
            onChange={(event) => onChange('longitude', event.target.value)}
          />
          {errors.longitude && (
            <span
              id={`${longitudeId}-error`}
              className="location-form-field__error"
              role="alert"
            >
              {resolveErrorMessage(errors.longitude)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
