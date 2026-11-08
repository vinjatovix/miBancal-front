import { useCallback, useState, type DragEvent, type JSX } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import Button from '../../../shared/components/Button/Button';
import { Loader } from '../../../shared/components/Loader/Loader';
import ScientificName from '../../../shared/components/ScientificName/ScientificName';
import { useDebouncedCallback } from '../../plants/PlantFilters/hooks/useDebouncedCallback';
import type { PlantListItem } from '../../../types/Plants/Plant';
import { usePlantCatalog } from '../../../pages/beds/hooks/usePlantCatalog';
import { calculateVitalRadius } from './utils/spatialCollisions';
import { PLANT_DRAG_MIME } from './placementDnd';

import './plantPlacementPalette.css';

export interface PlantPlacementPaletteProps {
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly onSelectPlant: (plant: PlantListItem) => void;
  readonly activePlacingPlantId?: string | null;
  readonly activePlacingPlantName?: string | null;
  readonly onCancelPlacing?: () => void;
  readonly onOpenManual?: () => void;
  readonly onDragPlant?: (plant: PlantListItem) => void;
}

type CatalogSource = 'all' | 'favorites';

function spacingMin(plant: PlantListItem): number | undefined {
  return plant.traits.spacingCm?.min;
}

export default function PlantPlacementPalette({
  isOpen,
  onClose,
  onSelectPlant,
  activePlacingPlantId,
  activePlacingPlantName,
  onCancelPlacing,
  onOpenManual,
  onDragPlant
}: PlantPlacementPaletteProps): JSX.Element | null {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<CatalogSource>('all');
  const debounced = useDebouncedCallback<string>(setSearch, 300);

  const onSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debounced.call(value);
    },
    [debounced]
  );

  const onlyFavorites = source === 'favorites';
  const hasSearch = search.trim() !== '';
  const shouldLoad = onlyFavorites || hasSearch;

  const query = usePlantCatalog(search, { onlyFavorites, enabled: shouldLoad });
  const plants = query.data?.data ?? [];
  const emptyKey = onlyFavorites
    ? 'bed.placement.palette_empty_favorites'
    : 'bed.placement.palette_empty';

  const handleDragStart = useCallback(
    (plant: PlantListItem) => (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.setData(PLANT_DRAG_MIME, plant.id);
      event.dataTransfer.setData('text/plain', plant.id);
      event.dataTransfer.effectAllowed = 'copy';
      onDragPlant?.(plant);
    },
    [onDragPlant]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className="plant-placement-palette"
      role="region"
      aria-label={t('bed.placement.palette_title')}
    >
      <div className="plant-placement-palette__header">
        <h2 className="plant-placement-palette__title">
          {t('bed.placement.palette_title')}
        </h2>
        {onClose && (
          <button
            type="button"
            className="plant-placement-palette__close"
            onClick={onClose}
            aria-label={t('bed.placement.palette_close')}
          >
            <Icon name="close" decorative />
          </button>
        )}
      </div>

      <label className="plant-placement-palette__search">
        <span className="sr-only">{t('bed.placement.search_label')}</span>
        <Icon name="search" decorative />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('bed.placement.search_placeholder')}
          aria-label={t('bed.placement.search_label')}
        />
      </label>

      <div
        className="plant-placement-palette__source"
        role="group"
        aria-label={t('bed.placement.source_label')}
      >
        <button
          type="button"
          className={`plant-placement-palette__source-option ${
            source === 'all'
              ? 'plant-placement-palette__source-option--active'
              : ''
          }`}
          aria-pressed={source === 'all'}
          onClick={() => setSource('all')}
        >
          {t('bed.placement.source_all')}
        </button>
        <button
          type="button"
          className={`plant-placement-palette__source-option ${
            source === 'favorites'
              ? 'plant-placement-palette__source-option--active'
              : ''
          }`}
          aria-pressed={source === 'favorites'}
          onClick={() => setSource('favorites')}
        >
          {t('bed.placement.source_favorites')}
        </button>
      </div>

      {onOpenManual && (
        <Button
          variant="secondary"
          size="sm"
          icon="straighten"
          onClick={onOpenManual}
        >
          {t('bed.placement.manual_action')}
        </Button>
      )}

      {activePlacingPlantId && (
        <div className="plant-placement-palette__placing" role="status">
          <span>
            {t('bed.placement.placing_active', {
              name: activePlacingPlantName ?? ''
            })}
          </span>
          <button
            type="button"
            onClick={onCancelPlacing}
            aria-label={t('bed.placement.placing_cancel')}
          >
            <Icon name="close" decorative />
          </button>
        </div>
      )}

      <div className="plant-placement-palette__body">
        {query.isLoading && <Loader labelKey="bed.placement.palette_loading" />}
        {query.isError && (
          <p className="plant-placement-palette__error" role="alert">
            {t('bed.placement.palette_error')}
          </p>
        )}
        {!shouldLoad && (
          <p className="plant-placement-palette__empty">
            {t('bed.placement.palette_search_prompt')}
          </p>
        )}
        {shouldLoad &&
          !query.isLoading &&
          !query.isError &&
          plants.length === 0 && (
            <div className="plant-placement-palette__empty-state">
              <p className="plant-placement-palette__empty">{t(emptyKey)}</p>
              <Link
                to="/plants/new"
                className="app-button app-button--secondary app-button--sm"
              >
                {t('bed.placement.palette_create_plant')}
              </Link>
            </div>
          )}
        <ul className="plant-placement-palette__list">
          {plants.map((plant) => {
            const min = spacingMin(plant);
            const radius = calculateVitalRadius(min);
            const isActive = activePlacingPlantId === plant.id;
            return (
              <li key={plant.id}>
                <button
                  type="button"
                  className={`plant-placement-palette__card ${
                    isActive ? 'plant-placement-palette__card--active' : ''
                  }`}
                  draggable
                  onDragStart={handleDragStart(plant)}
                  onClick={() => onSelectPlant(plant)}
                  aria-pressed={isActive}
                  aria-label={t('bed.placement.plant_place_action', {
                    name: plant.identity.name.primary
                  })}
                >
                  <span className="plant-placement-palette__card-icon">
                    <Icon name="potted_plant" decorative />
                  </span>
                  <span className="plant-placement-palette__card-text">
                    <span className="plant-placement-palette__card-name">
                      {plant.identity.name.primary}
                    </span>
                    {plant.identity.scientificName && (
                      <ScientificName>
                        {plant.identity.scientificName}
                      </ScientificName>
                    )}
                    <span className="plant-placement-palette__card-meta">
                      {t('bed.placement.vital_radius', {
                        radius: String(radius)
                      })}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
