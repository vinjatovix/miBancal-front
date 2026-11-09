import CropAssociationLine from './CropAssociationLine';
import type { LocationAssociationsLayerProps } from './types/cropAssociationTypes';
import { filterAssociationLinks } from './utils/cropAssociationGeometry';
import './locationAssociationsLayer.css';

export default function LocationAssociationsLayer({
  links,
  filterMode = 'all',
  onSelectLink
}: LocationAssociationsLayerProps) {
  const visibleLinks = filterAssociationLinks(links, filterMode);

  return (
    <g
      className="location-associations-layer"
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
