import { Link } from 'react-router-dom';

import PlantStatusBadge from '../../../components/plants/PlantStatusBadge/PlantStatusBadge';
import { t } from '../../../i18n/core/t';
import Badge from '../../../shared/components/Badge/Badge';
import FavoriteButton from '../../../shared/components/FavoriteButton/FavoriteButton';
import Icon from '../../../shared/components/Icon/Icon';
import ScientificName from '../../../shared/components/ScientificName/ScientificName';
import { useBookmarks } from '../../../shared/hooks/useBookmarks';
import { capitalizeFirstLetter } from '../../../shared/utils/capitalizeFirstLetter';
import type { PlantListItem } from '../../../types/Plants/Plant';
import PlantSafetyIndicators from '../components/PlantSafetyIndicators/PlantSafetyIndicators';
import { formatLikesCount } from './utils/formatLikesCount';
import { readPlantSafety } from '../utils/plantSafety';

import './plantCard.css';

export interface PlantCardProps {
  readonly plant: PlantListItem;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const bookmarks = useBookmarks();
  const hasLikes = plant.likesCount > 0;
  const formattedCount = hasLikes ? formatLikesCount(plant.likesCount) : '';
  const accessibleLabel =
    plant.likesCount === 1
      ? t('plant.card.likes_count_single')
      : t('plant.card.likes_count_plural', { count: formattedCount });

  return (
    <article className="plant-card">
      <FavoriteButton
        plantId={plant.id}
        isFavorite={bookmarks.data?.has(plant.id) ?? false}
        isReady={bookmarks.data !== undefined}
      />
      <Link
        to={`/plants/${plant.slug ?? plant.id}`}
        className="plant-card__link"
      >
        <div className="plant-card__heading">
          <h3>{capitalizeFirstLetter(plant.identity.name.primary)}</h3>
          <PlantSafetyIndicators safety={readPlantSafety(plant)} />
          <PlantStatusBadge status={plant.status} />
        </div>
        <img src={plant.image.url} alt={plant.identity.name.primary} />

        {plant.identity.scientificName && (
          <p className="plant-scientific-name">
            <Badge variant="scientific" icon="microscope">
              <ScientificName>
                {capitalizeFirstLetter(plant.identity.scientificName)}
              </ScientificName>
            </Badge>
          </p>
        )}

        {plant.identity.name.aliases.length > 0 && (
          <div className="plant-aliases">
            {plant.identity.name.aliases.map((alias) => (
              <Badge key={alias} variant="alias" icon="label">
                {capitalizeFirstLetter(alias)}
              </Badge>
            ))}
          </div>
        )}

        {hasLikes && (
          <footer className="plant-card__footer">
            <span className="plant-card__likes" aria-label={accessibleLabel}>
              <Icon name="thumb_up" decorative />
              <span aria-hidden="true">{formattedCount}</span>
            </span>
          </footer>
        )}
      </Link>
    </article>
  );
}
