import { useMemo, useState, type JSX } from 'react';

import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import Modal from '../../../../shared/components/Modal/Modal';
import ScientificName from '../../../../shared/components/ScientificName/ScientificName';

import './plantCatalogSheet.css';

export interface PlantCatalogSheetItem {
  readonly id: string;
  readonly commonName: string;
  readonly scientificName?: string;
}

export interface PlantCatalogSheetProps {
  readonly isOpen: boolean;
  readonly plants: readonly PlantCatalogSheetItem[];
  readonly onSelect: (plantId: string) => void;
  readonly onClose: () => void;
}

function matchesQuery(plant: PlantCatalogSheetItem, query: string): boolean {
  if (query === '') return true;
  const haystack = `${plant.commonName} ${plant.scientificName ?? ''}`.toLowerCase();
  return haystack.includes(query);
}

export default function PlantCatalogSheet({
  isOpen,
  plants,
  onSelect,
  onClose
}: PlantCatalogSheetProps): JSX.Element {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () => plants.filter((plant) => matchesQuery(plant, query)),
    [plants, query]
  );

  const handleSelect = (plantId: string): void => {
    onSelect(plantId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('location.layout.touch.catalog_title')}
      closeLabel={t('location.layout.touch.catalog_close')}
      overlayClassName="plant-catalog-sheet__overlay"
      className="plant-catalog-sheet"
    >
      <label className="plant-catalog-sheet__search">
        <span className="sr-only">
          {t('location.layout.touch.catalog_search')}
        </span>
        <Icon name="search" decorative />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('location.layout.touch.catalog_search')}
          aria-label={t('location.layout.touch.catalog_search')}
        />
      </label>
      {filtered.length === 0 ? (
        <p className="plant-catalog-sheet__empty">
          {t('location.layout.touch.catalog_empty')}
        </p>
      ) : (
        <ul className="plant-catalog-sheet__list">
          {filtered.map((plant) => (
            <li key={plant.id}>
              <button
                type="button"
                className="plant-catalog-sheet__item"
                onClick={() => handleSelect(plant.id)}
              >
                <span className="plant-catalog-sheet__item-name">
                  {plant.commonName}
                </span>
                {plant.scientificName && (
                  <ScientificName>{plant.scientificName}</ScientificName>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
