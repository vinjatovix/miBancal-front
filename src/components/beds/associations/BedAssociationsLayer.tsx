import CropAssociationLine from './CropAssociationLine';
import type { BedAssociationsLayerProps } from './types/cropAssociationTypes';
import { filterAssociationLinks } from './utils/cropAssociationGeometry';
import './bedAssociationsLayer.css';

export default function BedAssociationsLayer({
  links,
  filterMode = 'all',
  onSelectLink
}: BedAssociationsLayerProps) {
  const visibleLinks = filterAssociationLinks(links, filterMode);

  return (
    <g
      className="bed-associations-layer"
      aria-hidden={visibleLinks.length === 0 ? 'true' : undefined}
    >
      {visibleLinks.map((link) => (
        <CropAssociationLine
          key={link.id}
          link={link}
          onSelect={onSelectLink}
        />
      ))}
    </g>
  );
}
