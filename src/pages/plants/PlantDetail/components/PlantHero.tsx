import { Link } from 'react-router-dom';
import { useAuth } from '../../../../shared/auth/useAuth';
import { t } from '../../../../i18n/core/t';
import Badge from '../../../../shared/components/Badge/Badge';
import FavoriteButton from '../../../../shared/components/FavoriteButton/FavoriteButton';
import Icon from '../../../../shared/components/Icon/Icon';
import ScientificName from '../../../../shared/components/ScientificName/ScientificName';
import { useBookmarks } from '../../../../shared/hooks/useBookmarks';
import { capitalizeFirstLetter } from '../../../../shared/utils/capitalizeFirstLetter';
import type { Plant } from '../../../../types/Plants/Plant';
import { readPlantFamily } from '../../utils/plantFamily';
import { PlantLikeButton } from './PlantLikeButton/PlantLikeButton';

import './plantHero.css';

interface Props {
  readonly plant: Plant;
}

export default function PlantHero({ plant }: Props) {
  const familyView = readPlantFamily(plant.identity?.family);
  const bookmarks = useBookmarks();
  const auth = useAuth();

  return (
    <header className="plant-hero">
      <figure className="plant-hero__figure">
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
        {(plant.image.title || plant.image.source) && (
          <figcaption className="plant-hero__caption">
            {plant.image.title && (
              <span className="plant-hero__caption-title">
                {plant.image.title}
              </span>
            )}
            {plant.image.source && (
              <span className="plant-hero__caption-source">
                {t('plant.hero.source', { source: plant.image.source })}
              </span>
            )}
          </figcaption>
        )}
      </figure>

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
      <PlantLikeButton
        plantId={plant.id}
        userId={auth.user?.id}
        likesCount={plant.likesCount ?? 0}
      />
    </header>
  );
}
