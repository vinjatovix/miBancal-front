import type { JSX } from 'react';

import { t } from '../../../i18n/core/t';
import LayersPopoverButton, {
  type LayersPopoverButtonProps
} from '../visualizer/LayersPopoverButton';
import LayoutGlyph from './LayoutGlyph';

import './layoutFloatingToolDock.css';

export interface LayoutFloatingToolDockProps {
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onFitToScreen: () => void;
  readonly canUndo: boolean;
  readonly onUndo: () => void;
  readonly canRedo: boolean;
  readonly onRedo: () => void;
  readonly isFullscreen: boolean;
  readonly onToggleFullscreen: () => void;
  readonly layersProps: LayersPopoverButtonProps;
  readonly className?: string;
}

export default function LayoutFloatingToolDock({
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  isFullscreen,
  onToggleFullscreen,
  layersProps,
  className
}: LayoutFloatingToolDockProps): JSX.Element {
  return (
    <div
      className={
        className
          ? `layout-floating-tool-dock ${className}`
          : 'layout-floating-tool-dock'
      }
      role="toolbar"
      aria-label={t('bed.layout.floating_tools_label')}
    >
      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={t('bed.layout.zoom_in')}
        title={t('bed.layout.zoom_in')}
        onClick={onZoomIn}
      >
        <LayoutGlyph name="zoom-in" />
      </button>
      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={t('bed.layout.zoom_out')}
        title={t('bed.layout.zoom_out')}
        onClick={onZoomOut}
      >
        <LayoutGlyph name="zoom-out" />
      </button>
      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={t('bed.layout.reset_view')}
        title={t('bed.layout.reset_view')}
        onClick={onFitToScreen}
      >
        <LayoutGlyph name="fit" />
      </button>

      <span className="layout-floating-tool-dock__divider" aria-hidden="true" />

      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={t('location.layout.touch.undo')}
        title={t('location.layout.touch.undo')}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <LayoutGlyph name="undo" />
      </button>
      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={t('location.layout.touch.redo')}
        title={t('location.layout.touch.redo')}
        onClick={onRedo}
        disabled={!canRedo}
      >
        <LayoutGlyph name="redo" />
      </button>

      <span className="layout-floating-tool-dock__divider" aria-hidden="true" />

      <span className="layout-floating-tool-dock__layers">
        <LayersPopoverButton {...layersProps} isMobile />
      </span>

      <button
        type="button"
        className="layout-floating-tool-dock__button"
        aria-label={
          isFullscreen
            ? t('bed.visualizer.fullscreen_exit')
            : t('bed.visualizer.fullscreen_enter')
        }
        title={
          isFullscreen
            ? t('bed.visualizer.fullscreen_exit')
            : t('bed.visualizer.fullscreen_enter')
        }
        aria-pressed={isFullscreen}
        onClick={onToggleFullscreen}
      >
        <LayoutGlyph name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />
      </button>
    </div>
  );
}
