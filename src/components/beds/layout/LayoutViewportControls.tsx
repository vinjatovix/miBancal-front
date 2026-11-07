import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type { BedViewportState } from '../visualizer/hooks/useBedViewport';

import './layoutControls.css';

export interface LayoutViewportControlsProps {
  readonly viewport: BedViewportState;
}

export default function LayoutViewportControls({
  viewport
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
        <Icon name="zoom_in" decorative />
      </button>
      <button
        type="button"
        className="layout-viewport-controls__button"
        aria-label={t('bed.layout.zoom_out')}
        onClick={viewport.zoomOut}
      >
        <Icon name="zoom_out" decorative />
      </button>
      <span className="layout-viewport-controls__divider" aria-hidden="true" />
      <button
        type="button"
        className="layout-viewport-controls__button layout-viewport-controls__recenter"
        aria-label={t('bed.layout.reset_view')}
        onClick={viewport.resetZoom}
      >
        <Icon name="fit_screen" decorative />
      </button>
    </div>
  );
}
