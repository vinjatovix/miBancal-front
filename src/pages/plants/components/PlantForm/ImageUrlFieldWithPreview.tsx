import { useState, type ChangeEvent } from 'react';
import { t } from '../../../../i18n/core/t';
import './imageUrlFieldWithPreview.css';

export interface ImageUrlFieldWithPreviewProps {
  readonly url: string;
  readonly onChange: (url: string) => void;
  readonly onBlur?: () => void;
  readonly error?: string;
  readonly label: string;
  readonly required?: boolean;
}

export function ImageUrlFieldWithPreview({
  url,
  onChange,
  onBlur,
  error,
  label,
  required
}: ImageUrlFieldWithPreviewProps) {
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const isValidUrl = /^https?:\/\//i.test(url.trim());

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoadFailed(false);
    onChange(e.target.value);
  };

  return (
    <div className="image-url-field">
      <label htmlFor="plant-image-url-input" className="image-url-field__label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id="plant-image-url-input"
        type="url"
        className="image-url-field__input"
        value={url}
        onChange={handleChange}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : 'false'}
        placeholder={t('plant.form.fields.image_url_placeholder')}
      />
      {error && (
        <span role="alert" className="image-url-field__error">
          {error}
        </span>
      )}
      {isValidUrl && (
        <div className="image-url-field__preview-container">
          <img
            src={url.trim()}
            alt={t('plant.form.image.preview_alt')}
            width={120}
            height={120}
            loading="lazy"
            className="image-url-field__preview-img"
            onError={() => setLoadFailed(true)}
          />
          {loadFailed && (
            <span role="alert" className="image-url-field__error">
              {t('plant.form.image.load_error')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
