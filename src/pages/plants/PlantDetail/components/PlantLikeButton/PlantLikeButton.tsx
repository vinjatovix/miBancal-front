import { useLocation } from 'react-router-dom';
import { useReportedNavigate } from '../../../../../shared/observability/useReportedNavigate';

import { t } from '../../../../../i18n/core/t';
import Icon from '../../../../../shared/components/Icon/Icon';
import { usePlantLike } from '../../../hooks/usePlantLike';
import { useTogglePlantLike } from '../../../hooks/useTogglePlantLike';

import './plantLikeButton.css';

interface PlantLikeButtonProps {
  readonly plantId: string;
  readonly userId?: string;
  readonly likesCount: number;
}

function resolvePlantLikeAriaLabel(
  userId: string | undefined,
  liked: boolean,
  likesCount: number
): string {
  if (userId) {
    if (liked) {
      return t('plantLikeButton.aria_label_count_pressed', {
        count: likesCount
      });
    }
    return t('plantLikeButton.aria_label_count_unpressed', {
      count: likesCount
    });
  }
  if (liked) {
    return t('plantLikeButton.aria_label_zero_pressed');
  }
  return t('plantLikeButton.aria_label_zero_unpressed');
}

export function PlantLikeButton({
  plantId,
  userId,
  likesCount
}: PlantLikeButtonProps) {
  const navigate = useReportedNavigate('plant-like-button');
  const location = useLocation();
  const { data } = usePlantLike(plantId, userId);
  const { like, unlike, isPending } = useTogglePlantLike(plantId, userId);

  const liked = data?.liked ?? false;

  const handleClick = () => {
    if (!userId) {
      navigate('/login', {
        state: {
          from: location,
          scrollY: typeof window !== 'undefined' ? window.scrollY : 0
        }
      });
      return;
    }
    if (liked) {
      unlike();
    } else {
      like();
    }
  };

  const ariaLabel = resolvePlantLikeAriaLabel(userId, liked, likesCount);

  return (
    <button
      className="plant-like-button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={ariaLabel}
    >
      <Icon
        name={liked ? 'thumb_up_filled' : 'thumb_up'}
        className="plant-like-button__icon"
        decorative
      />
      {likesCount > 0 ? likesCount : t('plantLikeButton.be_first_to_like')}
    </button>
  );
}
