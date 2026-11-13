import type React from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';

import './bedViewportControls.css';

export interface BedViewportControlsProps {
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onReset: () => void;
  readonly onToggleFullscreen?: () => void;
  readonly isFullscreen?: boolean;
}

export default function BedViewportControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleFullscreen,
  isFullscreen = false
}: BedViewportControlsProps): React.JSX.Element {
  const fullscreenLabel = isFullscreen
    ? t('bed.visualizer.fullscreen_exit')
    : t('bed.visualizer.fullscreen_enter');

  return (
    <div
      className="bed-viewport-controls"
      role="toolbar"
      aria-label={t('bed.visualizer.controls_label')}
    >
      <button
        type="button"
        className="bed-viewport-controls__button"
        aria-label={t('bed.visualizer.zoom_in')}
        onClick={onZoomIn}
      >
        <Icon name="zoom_in" decorative />
      </button>
      <button
        type="button"
        className="bed-viewport-controls__button"
        aria-label={t('bed.visualizer.zoom_out')}
        onClick={onZoomOut}
      >
        <Icon name="zoom_out" decorative />
      </button>
      <button
        type="button"
        className="bed-viewport-controls__button"
        aria-label={t('bed.visualizer.fit_screen')}
        onClick={onReset}
      >
        <Icon name="sync_alt" decorative />
      </button>
      {onToggleFullscreen && (
        <button
          type="button"
          className="bed-viewport-controls__button"
          aria-label={fullscreenLabel}
          onClick={onToggleFullscreen}
        >
          <Icon name="fit_screen" decorative />
        </button>
      )}
    </div>
  );
}
