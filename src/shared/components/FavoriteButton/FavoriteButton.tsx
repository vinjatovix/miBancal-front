import { useContext, type MouseEvent } from 'react';

import { t } from '../../../i18n/core/t';
import { AuthContext } from '../../auth/authContextDef';
import { useToggleBookmark } from '../../hooks/useToggleBookmark';
import Icon from '../Icon/Icon';

import './favoriteButton.css';

interface Props {
  readonly plantId: string;
  readonly isFavorite: boolean;
  readonly isReady?: boolean;
}

export default function FavoriteButton({
  plantId,
  isFavorite,
  isReady = true
}: Props) {
  const auth = useContext(AuthContext);
  const toggleBookmark = useToggleBookmark();

  if (!auth?.isAuthenticated) return null;

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    toggleBookmark.mutate({ plantId, isFavorite });
  }

  return (
    <div className="favorite-button-wrapper">
      <button
        type="button"
        className="favorite-button"
        aria-pressed={isFavorite}
        aria-label={t(
          isFavorite ? 'favoriteButton.remove' : 'favoriteButton.add'
        )}
        onClick={handleClick}
        disabled={!isReady || toggleBookmark.isPending}
      >
        <Icon name={isFavorite ? 'favorite_filled' : 'favorite'} decorative />
      </button>

      {toggleBookmark.isError && (
        <p role="alert" className="favorite-button__error">
          {t('favoriteButton.error')}
        </p>
      )}
    </div>
  );
}
