import type { JSX, ReactNode } from 'react';

import { t } from '../../../../i18n/core/t';

export interface LayoutTopBarProps {
  readonly leftZone?: ReactNode;
  readonly centerZone?: ReactNode;
  readonly rightZone?: ReactNode;
  readonly className?: string;
}

export default function LayoutTopBar({
  leftZone,
  centerZone,
  rightZone,
  className
}: LayoutTopBarProps): JSX.Element {
  return (
    <header
      className={`layout-top-bar ${className ?? ''}`.trim()}
      role="toolbar"
      aria-label={t('bed.layout.designer_mode_group')}
    >
      <div
        className="layout-top-bar__zone layout-top-bar__zone--left"
        role="group"
        aria-label={t('bed.layout.designer_mode_group')}
      >
        {leftZone}
      </div>
      <div
        className="layout-top-bar__zone layout-top-bar__zone--center"
        role="group"
        aria-label={t('bed.placement.tools_toolbar_label')}
      >
        {centerZone}
      </div>
      <div
        className="layout-top-bar__zone layout-top-bar__zone--right"
        role="group"
        aria-label={t('bed.layout.viewport_group_label')}
      >
        {rightZone}
      </div>
    </header>
  );
}
