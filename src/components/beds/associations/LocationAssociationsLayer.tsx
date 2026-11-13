import CropAssociationLine from './CropAssociationLine';
import type { LocationAssociationsLayerProps } from './types/cropAssociationTypes';
import { filterAssociationLinks } from './utils/cropAssociationGeometry';
import './locationAssociationsLayer.css';

export default function LocationAssociationsLayer({
  links,
  filterMode = 'all',
  highlightCropId = null,
  onSelectLink
}: LocationAssociationsLayerProps) {
  const filteredLinks = filterAssociationLinks(links, filterMode);
  const visibleLinks =
    highlightCropId === null
      ? filteredLinks
      : filteredLinks.filter(
          (link) =>
            link.cropA.id === highlightCropId ||
            link.cropB.id === highlightCropId
        );

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
