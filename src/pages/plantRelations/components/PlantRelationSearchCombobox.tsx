import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import ScientificName from '../../../shared/components/ScientificName/ScientificName';
import type { PlantListItem } from '../../../types/Plants/Plant';
import { usePlantSearch } from '../hooks/usePlantSearch';
import './plantRelationSearchCombobox.css';

export interface PlantRelationSearchComboboxProps {
  readonly selectedPlant: PlantListItem | null;
  readonly onSelectPlant: (plant: PlantListItem | null) => void;
  readonly excludePlantId?: string;
}

export default function PlantRelationSearchCombobox({
  selectedPlant,
  onSelectPlant,
  excludePlantId
}: PlantRelationSearchComboboxProps) {
  const [prevSelectedPlant, setPrevSelectedPlant] =
    useState<PlantListItem | null>(selectedPlant);
  const [query, setQuery] = useState(
    selectedPlant ? selectedPlant.identity.name.primary : ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (selectedPlant !== prevSelectedPlant) {
    setPrevSelectedPlant(selectedPlant);
    setQuery(selectedPlant ? selectedPlant.identity.name.primary : '');
  }

  const { data, isLoading } = usePlantSearch(query, isOpen);
  const rawResults = data?.data ?? [];
  const results = excludePlantId
    ? rawResults.filter((plant) => plant.id !== excludePlantId)
    : rawResults;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (!newQuery.trim() && selectedPlant) {
      onSelectPlant(null);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onSelectPlant(null);
  };

  const handleSelect = (plant: PlantListItem) => {
    onSelectPlant(plant);
    setQuery(plant.identity.name.primary);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="plant-search-combobox" ref={wrapperRef}>
      <div className="plant-search-combobox__input-wrapper">
        <Icon
          name="search"
          decorative
          className="plant-search-combobox__icon"
        />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-controls="plant-combobox-listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0 && results[highlightedIndex]
              ? `plant-combobox-opt-${results[highlightedIndex].id}`
              : undefined
          }
          aria-label={t('plantRelations.searchAriaLabel')}
          placeholder={t('plantRelations.searchPlaceholder')}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="plant-search-combobox__input"
        />
        {(query || selectedPlant) && (
          <button
            type="button"
            className="plant-search-combobox__clear-button"
            aria-label={t('plantRelations.clearSelection')}
            onClick={handleClear}
          >
            <Icon name="close" decorative />
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          id="plant-combobox-listbox"
          role="listbox"
          className="plant-search-combobox__listbox"
        >
          {isLoading && (
            <li role="status" className="plant-search-combobox__status">
              {t('plantRelations.loadingSearch')}
            </li>
          )}
          {!isLoading && results.length === 0 && query.trim().length >= 2 && (
            <li role="status" className="plant-search-combobox__status">
              {t('plantRelations.noSearchResults')}
            </li>
          )}
          {results.map((plant, index) => {
            const isSelected = selectedPlant?.id === plant.id;
            const isHighlighted = highlightedIndex === index;

            return (
              <li
                key={plant.id}
                id={`plant-combobox-opt-${plant.id}`}
                role="option"
                aria-selected={isSelected}
                className={`plant-search-combobox__option ${
                  isHighlighted
                    ? 'plant-search-combobox__option--highlighted'
                    : ''
                } ${isSelected ? 'plant-search-combobox__option--selected' : ''}`}
                onClick={() => handleSelect(plant)}
              >
                {plant.image?.url ? (
                  <img
                    src={plant.image.url}
                    alt={plant.identity.name.primary}
                    className="plant-search-combobox__avatar"
                  />
                ) : (
                  <span className="plant-search-combobox__avatar-fallback">
                    <Icon name="local_florist" decorative />
                  </span>
                )}
                <div className="plant-search-combobox__identity">
                  <span className="plant-search-combobox__name">
                    {plant.identity.name.primary}
                  </span>
                  {plant.identity.scientificName && (
                    <ScientificName variant="secondary">
                      {plant.identity.scientificName}
                    </ScientificName>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
