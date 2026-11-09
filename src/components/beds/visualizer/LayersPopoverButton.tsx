import { useCallback, useEffect, useRef, useState, type JSX } from 'react';

import LayoutGlyph from '../layout/LayoutGlyph';
import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import type { AssociationFilterMode } from '../associations/types/cropAssociationTypes';
import {
  BED_GRID_LAYERS,
  type ActiveGridLayers,
  type BedGridLayerKey
} from './utils/bedGridConfig';

import './layersPopoverButton.css';

export interface LayersPopoverButtonProps {
  readonly showNames: boolean;
  readonly onToggleNames: () => void;
  readonly showDimensions: boolean;
  readonly onToggleDimensions: () => void;
  readonly showPlants: boolean;
  readonly onTogglePlants: () => void;
  readonly showCardinalOrientation: boolean;
  readonly onToggleCardinalOrientation: () => void;
  readonly showGrids: boolean;
  readonly onToggleGrids: () => void;
  readonly activeGridLayers: ActiveGridLayers;
  readonly onToggleGridLayer: (key: BedGridLayerKey) => void;
  readonly showAssociations?: boolean;
  readonly onToggleAssociations?: () => void;
  readonly associationFilterMode?: AssociationFilterMode;
  readonly onSelectAssociationFilterMode?: (
    mode: AssociationFilterMode
  ) => void;
  readonly disabled?: boolean;
}

export default function LayersPopoverButton({
  showNames,
  onToggleNames,
  showDimensions,
  onToggleDimensions,
  showPlants,
  onTogglePlants,
  showCardinalOrientation,
  onToggleCardinalOrientation,
  showGrids,
  onToggleGrids,
  activeGridLayers,
  onToggleGridLayer,
  showAssociations = true,
  onToggleAssociations,
  associationFilterMode = 'all',
  onSelectAssociationFilterMode,
  disabled = false
}: LayersPopoverButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div ref={containerRef} className="layers-popover-button">
      <button
        ref={triggerRef}
        type="button"
        className="layers-popover-button__trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={toggle}
      >
        <LayoutGlyph name="layers" />
        <span>{t('bed.layout.layers_button')}</span>
      </button>

      {isOpen && (
        <div
          className="layers-popover-button__popover"
          role="dialog"
          aria-modal="true"
          aria-label={t('bed.layout.layers_popover_title')}
        >
          <div className="layers-popover-button__header">
            <span>{t('bed.layout.layers_popover_title')}</span>
          </div>

          <div
            className="layers-popover-button__switches"
            role="group"
            aria-label={t('bed.layout.layers_group_label')}
          >
            <label className="layers-popover-button__row">
              <span>{t('bed.layout.layer_names')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showNames}
                aria-label={t('bed.layout.layer_names')}
                className="layers-popover-button__switch"
                onClick={onToggleNames}
              >
                <span
                  className="layers-popover-button__thumb"
                  aria-hidden="true"
                />
              </button>
            </label>

            <label className="layers-popover-button__row">
              <span>{t('bed.layout.layer_dimensions')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showDimensions}
                aria-label={t('bed.layout.layer_dimensions')}
                className="layers-popover-button__switch"
                onClick={onToggleDimensions}
              >
                <span
                  className="layers-popover-button__thumb"
                  aria-hidden="true"
                />
              </button>
            </label>

            <label className="layers-popover-button__row">
              <span>{t('bed.layout.layer_plants')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showPlants}
                aria-label={t('bed.layout.layer_plants')}
                className="layers-popover-button__switch"
                onClick={onTogglePlants}
              >
                <span
                  className="layers-popover-button__thumb"
                  aria-hidden="true"
                />
              </button>
            </label>

            {onToggleAssociations && (
              <>
                <label className="layers-popover-button__row">
                  <span>{t('bed.associations.layer_toggle')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showAssociations}
                    aria-label={t('bed.associations.layer_toggle')}
                    className="layers-popover-button__switch"
                    onClick={onToggleAssociations}
                  >
                    <span
                      className="layers-popover-button__thumb"
                      aria-hidden="true"
                    />
                  </button>
                </label>

                {showAssociations && onSelectAssociationFilterMode && (
                  <label className="layers-popover-button__row layers-popover-button__row--sub">
                    <span className="layers-popover-button__sublabel">
                      {t('bed.associations.filter_detrimental_only')}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={
                        associationFilterMode === 'detrimental_only'
                      }
                      aria-label={t('bed.associations.filter_detrimental_only')}
                      className="layers-popover-button__switch"
                      onClick={() =>
                        onSelectAssociationFilterMode(
                          associationFilterMode === 'all'
                            ? 'detrimental_only'
                            : 'all'
                        )
                      }
                    >
                      <span
                        className="layers-popover-button__thumb"
                        aria-hidden="true"
                      />
                    </button>
                  </label>
                )}
              </>
            )}

            <label className="layers-popover-button__row">
              <span>{t('bed.layout.layer_cardinal')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showCardinalOrientation}
                aria-label={t('bed.layout.layer_cardinal')}
                className="layers-popover-button__switch"
                onClick={onToggleCardinalOrientation}
              >
                <span
                  className="layers-popover-button__thumb"
                  aria-hidden="true"
                />
              </button>
            </label>

            <label className="layers-popover-button__row">
              <span>{t('bed.layout.layer_grids')}</span>
              <button
                type="button"
                role="switch"
                aria-checked={showGrids}
                aria-label={t('bed.layout.layer_grids')}
                className="layers-popover-button__switch"
                onClick={onToggleGrids}
              >
                <span
                  className="layers-popover-button__thumb"
                  aria-hidden="true"
                />
              </button>
            </label>

            <div
              className="layers-popover-button__sublist"
              role="group"
              aria-label={t('bed.grids.group_label')}
            >
              {BED_GRID_LAYERS.map((layer) => {
                const isActive = Boolean(activeGridLayers?.[layer.key]);
                const label = t(layer.labelKey as I18nKey);
                return (
                  <label
                    key={layer.key}
                    className="layers-popover-button__row layers-popover-button__row--sub"
                  >
                    <span className="layers-popover-button__sublabel">
                      <span
                        className="layers-popover-button__dot"
                        style={{
                          backgroundColor: isActive
                            ? layer.strokeColor
                            : undefined
                        }}
                        aria-hidden="true"
                      />
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      aria-label={label}
                      className="layers-popover-button__switch"
                      onClick={() => onToggleGridLayer(layer.key)}
                    >
                      <span
                        className="layers-popover-button__thumb"
                        aria-hidden="true"
                      />
                    </button>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
