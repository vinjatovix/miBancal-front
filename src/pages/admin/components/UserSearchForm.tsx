import { useState } from 'react';
import Icon from '../../../shared/components/Icon/Icon';
import { t } from '../../../i18n/core/t';

interface Props {
  readonly onSearch: (query: string) => void;
  readonly isLoading: boolean;
}

export function UserSearchForm({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="admin-search-form">
      <div className="admin-search-header-row">
        <label htmlFor="user-search" className="admin-search-label">
          <span>{t('admin.search_label')}</span>
        </label>
      </div>

      <div className="admin-search-input-group">
        <div className="admin-search-input-wrap">
          <input
            id="user-search"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            role="searchbox"
            aria-label={t('admin.search_label')}
            placeholder={t('admin.search_placeholder')}
            className="admin-search-input"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="admin-search-clear-btn"
              aria-label={t('admin.clear_search_aria')}
            >
              <Icon name="close" decorative />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="admin-btn-primary admin-search-btn"
        >
          <Icon name="search" decorative />
          <span>
            {isLoading ? t('admin.search_loading') : t('admin.search_button')}
          </span>
        </button>
      </div>
    </form>
  );
}
