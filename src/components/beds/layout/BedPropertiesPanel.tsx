import { useCallback, useState, type JSX, type KeyboardEvent } from 'react';

import { t } from '../../../i18n/core/t';
import Button from '../../../shared/components/Button/Button';
import { normalizeAngle } from './utils/cardinalGeometry';
import type { ResolvedBed } from './utils/layoutTypes';

import './bedPropertiesPanel.css';

export interface BedPropertiesPanelProps {
  readonly bed: ResolvedBed;
  readonly onRenameInline: (name: string) => void;
  readonly onOpenFullEdit: () => void;
  readonly onRotationChange?: (degrees: number) => void;
  readonly disabled?: boolean;
}

export default function BedPropertiesPanel({
  bed,
  onRenameInline,
  onOpenFullEdit,
  onRotationChange,
  disabled = false
}: BedPropertiesPanelProps): JSX.Element {
  const [name, setName] = useState(bed.name);
  const [prevBedName, setPrevBedName] = useState(bed.name);

  if (bed.name !== prevBedName) {
    setPrevBedName(bed.name);
    setName(bed.name);
  }

  const commitRename = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== bed.name) {
      onRenameInline(trimmed);
    } else {
      setName(bed.name);
    }
  }, [name, bed.name, onRenameInline]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitRename();
      } else if (e.key === 'Escape') {
        setName(bed.name);
      }
    },
    [commitRename, bed.name]
  );

  const handleRotationKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      const isStepUp = event.key === 'ArrowUp' || event.key === 'ArrowRight';
      const isStepDown = event.key === 'ArrowDown' || event.key === 'ArrowLeft';
      if (!isStepUp && !isStepDown) return;

      event.preventDefault();
      const step = event.shiftKey ? 15 : 1;
      const delta = isStepUp ? step : -step;
      onRotationChange?.(normalizeAngle(bed.rotation + delta));
    },
    [bed.rotation, onRotationChange]
  );

  return (
    <div className="bed-properties-panel">
      <h3 className="bed-properties-panel__title">
        {t('bed.layout.properties_title')}
      </h3>

      <div className="bed-properties-panel__field">
        <label
          htmlFor="bed-properties-name"
          className="bed-properties-panel__label"
        >
          {t('bed.layout.properties_name_label')}
        </label>
        <input
          id="bed-properties-name"
          type="text"
          className="bed-properties-panel__input"
          value={name}
          disabled={disabled}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
        />
      </div>

      <div className="bed-properties-panel__field">
        <span className="bed-properties-panel__label">
          {t('bed.layout.properties_dimensions_label')}
        </span>
        <span className="bed-properties-panel__value">
          {bed.width} × {bed.height} cm
        </span>
      </div>

      <div className="bed-properties-panel__field">
        <label
          htmlFor="bed-properties-rotation"
          className="bed-properties-panel__label"
        >
          {t('bed.layout.properties_rotation_label')}
        </label>
        <input
          id="bed-properties-rotation"
          type="number"
          min={0}
          max={359}
          className="bed-properties-panel__input"
          value={bed.rotation}
          disabled={disabled || !onRotationChange}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (Number.isFinite(val)) {
              onRotationChange?.(normalizeAngle(val));
            }
          }}
          onKeyDown={handleRotationKeyDown}
        />
      </div>

      <div className="bed-properties-panel__actions">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={onOpenFullEdit}
        >
          {t('bed.layout.properties_full_edit')}
        </Button>
      </div>
    </div>
  );
}
