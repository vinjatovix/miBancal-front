import type React from 'react';

import { t } from '../../../i18n/core/t';
import type { I18nKey } from '../../../i18n/core/types';
import {
  BED_GRID_LAYERS,
  type ActiveGridLayers,
  type BedGridLayerKey
} from './utils/bedGridConfig';

import './bedGridControls.css';

export interface BedGridControlsProps {
  readonly activeLayers: ActiveGridLayers;
  readonly onToggleLayer: (key: BedGridLayerKey) => void;
}

export default function BedGridControls({
  activeLayers,
  onToggleLayer
}: BedGridControlsProps): React.JSX.Element {
  return (
    <fieldset className="bed-grid-controls" role="group">
      <legend className="bed-grid-controls__legend">
        {t('bed.grids.group_label')}
      </legend>
      <div className="bed-grid-controls__buttons">
        {BED_GRID_LAYERS.map((layer) => {
          const isActive = Boolean(activeLayers?.[layer.key]);
          const label = t(layer.labelKey as I18nKey);

          return (
            <button
              key={layer.key}
              type="button"
              className={`bed-grid-controls__toggle bed-grid-controls__toggle--${layer.key}`}
              aria-pressed={isActive}
              onClick={() => onToggleLayer(layer.key)}
            >
              <span
                className="bed-grid-controls__dot"
                style={{
                  backgroundColor: isActive ? layer.strokeColor : undefined
                }}
                aria-hidden="true"
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
