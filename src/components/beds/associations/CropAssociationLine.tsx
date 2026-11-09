import type React from 'react';
import { t } from '../../../i18n/core/t';
import type { ActiveAssociationLink } from './types/cropAssociationTypes';
import './cropAssociationLine.css';

export interface CropAssociationLineProps {
  readonly link: ActiveAssociationLink;
  readonly onSelect?: (link: ActiveAssociationLink) => void;
}

export default function CropAssociationLine({
  link,
  onSelect
}: CropAssociationLineProps) {
  const accessibleLabel = link.isWarningPriority
    ? t('bed.associations.link_warning_priority_label', {
        plantA: link.cropA.commonName,
        plantB: link.cropB.commonName,
        distance: link.distanceCm
      })
    : link.visualPolarity === 'beneficial'
      ? t('bed.associations.link_beneficial_label', {
          plantA: link.cropA.commonName,
          plantB: link.cropB.commonName,
          distance: link.distanceCm
        })
      : t('bed.associations.link_detrimental_label', {
          plantA: link.cropA.commonName,
          plantB: link.cropB.commonName,
          distance: link.distanceCm
        });

  const handlePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect?.(link);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onSelect?.(link);
    }
  };

  const isDetrimental = link.visualPolarity === 'detrimental';

  return (
    <g
      className="crop-association-line"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <line
        x1={link.cropA.x}
        y1={link.cropA.y}
        x2={link.cropB.x}
        y2={link.cropB.y}
        className={`crop-association-line__visual crop-association-line__visual--${link.visualPolarity}`}
        strokeDasharray={isDetrimental ? '6 4' : undefined}
      />
      <line
        x1={link.cropA.x}
        y1={link.cropA.y}
        x2={link.cropB.x}
        y2={link.cropB.y}
        strokeWidth="24"
        stroke="transparent"
        className="crop-association-line__hit-target"
        pointerEvents="stroke"
        role="button"
        tabIndex={0}
        aria-label={accessibleLabel}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
      {isDetrimental && (
        <g
          className="crop-association-line__warning-glyph"
          transform={`translate(${link.midpoint.x}, ${link.midpoint.y})`}
        >
          <circle r="7" className="crop-association-line__warning-glyph-bg" />
          <path
            d="M-1 -3.5h2v4.5h-2zM-1 2h2v2h-2z"
            className="crop-association-line__warning-glyph-icon"
          />
        </g>
      )}
    </g>
  );
}
