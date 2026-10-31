import { useNavigate, useLocation } from 'react-router-dom';

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

export function PlantLikeButton({
  plantId,
  userId,
  likesCount
}: PlantLikeButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = usePlantLike(plantId, userId);
  const { mutate, isPending } = useTogglePlantLike(plantId, userId);

  const liked = data?.liked ?? false;

  const handleClick = () => {
    if (!userId) {
      navigate('/login', { state: { from: location } });
      return;
    }
    mutate(liked);
  };

  const ariaLabel = userId
    ? liked
      ? t('plantLikeButton.aria_label_count_pressed', { count: likesCount })
      : t('plantLikeButton.aria_label_count_unpressed', { count: likesCount })
    : liked
      ? t('plantLikeButton.aria_label_zero_pressed')
      : t('plantLikeButton.aria_label_zero_unpressed');

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
