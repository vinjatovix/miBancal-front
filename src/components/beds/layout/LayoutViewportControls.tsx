import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import type { BedViewportState } from '../visualizer/hooks/useBedViewport';
import LayoutGlyph from './LayoutGlyph';

import './layoutControls.css';

export interface LayoutViewportControlsProps {
  readonly viewport: BedViewportState;
  readonly onFitToView?: () => void;
}

export default function LayoutViewportControls({
  viewport,
  onFitToView
}: LayoutViewportControlsProps): JSX.Element {
  return (
    <div
      className="layout-viewport-controls"
      role="toolbar"
      aria-label={t('bed.layout.viewport_group_label')}
    >
      <button
        type="button"
        className="layout-viewport-controls__button"
        aria-label={t('bed.layout.zoom_in')}
        onClick={viewport.zoomIn}
      >
        <LayoutGlyph name="zoom-in" />
      </button>
      <span className="layout-viewport-controls__percent" aria-live="polite">
        {t('bed.layout.zoom_percent', {
          percent: String(viewport.zoomPercent)
        })}
      </span>
      <button
        type="button"
        className="layout-viewport-controls__button"
        aria-label={t('bed.layout.zoom_out')}
        onClick={viewport.zoomOut}
      >
        <LayoutGlyph name="zoom-out" />
      </button>
      <span className="layout-viewport-controls__divider" aria-hidden="true" />
      <button
        type="button"
        className="layout-viewport-controls__button layout-viewport-controls__recenter"
        aria-label={t('bed.layout.reset_view')}
        onClick={onFitToView ?? viewport.resetZoom}
      >
        <LayoutGlyph name="fit" />
      </button>
    </div>
  );
}
