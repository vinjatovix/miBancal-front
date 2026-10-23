import { Link } from 'react-router-dom';

import { t } from '../../../../i18n/core/t';
import Badge from '../../../../shared/components/Badge/Badge';
import FavoriteButton from '../../../../shared/components/FavoriteButton/FavoriteButton';
import Icon from '../../../../shared/components/Icon/Icon';
import ScientificName from '../../../../shared/components/ScientificName/ScientificName';
import { useBookmarks } from '../../../../shared/hooks/useBookmarks';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Plant } from '../../../../types/Plants/Plant';
import { readPlantFamily } from '../../utils/plantFamily';

import './plantHero.css';

interface Props {
  readonly plant: Plant;
}

export default function PlantHero({ plant }: Props) {
  const familyView = readPlantFamily(plant.identity?.family);
  const bookmarks = useBookmarks();

  return (
    <header className="plant-hero">
      <div className="plant-hero__image-wrapper">
        <img
          className="plant-hero__image"
          src={plant.image.url}
          alt={plant.identity.name.primary}
        />
        <FavoriteButton
          plantId={plant.id}
          isFavorite={bookmarks.data?.has(plant.id) ?? false}
          isReady={bookmarks.data !== undefined}
        />
      </div>

      {familyView?.kind === 'linked' && (
        <Link
          to={`/families/${encodeURIComponent(familyView.slug)}`}
          className="plant-hero__family-link"
        >
          <Badge variant="family" icon="biotech">
            {familyView.name}
          </Badge>
        </Link>
      )}

      {familyView?.kind === 'unavailable' && (
        <Badge variant="unavailable" icon="biotech">
          {t('plant.hero.family_unavailable')}
        </Badge>
      )}

      {plant.identity.scientificName && (
        <p className="plant-hero__scientific">
          <strong>
            <Icon name="microscope" decorative />{' '}
            {t('plant.hero.scientific_name')}:{' '}
          </strong>
          <ScientificName>
            {capitalizeFirstLetter(plant.identity.scientificName)}
          </ScientificName>
        </p>
      )}
    </header>
  );
}
