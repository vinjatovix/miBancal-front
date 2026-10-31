import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import type {
  ArticleResourceFormItem,
  ImageResourceFormItem,
  VideoResourceFormItem
} from '../utils/gardenInputValidation';

interface Props {
  readonly images: readonly ImageResourceFormItem[];
  readonly videoResources: readonly VideoResourceFormItem[];
  readonly articleResources: readonly ArticleResourceFormItem[];
  readonly onAddImage: () => void;
  readonly onUpdateImage: (
    id: string,
    patch: Partial<Omit<ImageResourceFormItem, 'id'>>
  ) => void;
  readonly onRemoveImage: (id: string) => void;
  readonly onAddVideo: () => void;
  readonly onUpdateVideo: (
    id: string,
    patch: Partial<Omit<VideoResourceFormItem, 'id'>>
  ) => void;
  readonly onRemoveVideo: (id: string) => void;
  readonly onAddArticle: () => void;
  readonly onUpdateArticle: (
    id: string,
    patch: Partial<Omit<ArticleResourceFormItem, 'id'>>
  ) => void;
  readonly onRemoveArticle: (id: string) => void;
  readonly error?: string;
}

export default function ResourcesFormSection({
  images,
  videoResources,
  articleResources,
  onAddImage,
  onUpdateImage,
  onRemoveImage,
  onAddVideo,
  onUpdateVideo,
  onRemoveVideo,
  onAddArticle,
  onUpdateArticle,
  onRemoveArticle,
  error
}: Props) {
  return (
    <fieldset className="garden-input-form__resources-section">
      <legend className="garden-input-form__label">
        {t('gardenInput.form.resources_section')}
      </legend>

      {error && (
        <p className="garden-input-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="garden-input-form__resources-subgroup">
        <h3 className="garden-input-form__resources-subtitle">
          {t('gardenInput.form.resources_images')}
        </h3>
        {images.map((img, index) => (
          <div key={img.id} className="garden-input-form__resource-item">
            {img.url.trim() !== '' && (
              <img
                src={img.url}
                alt=""
                className="garden-input-form__img-preview"
                loading="lazy"
              />
            )}
            <div className="garden-input-form__group">
              <label htmlFor={`image-url-${img.id}`}>
                {t('gardenInput.form.resource_image_url')}
              </label>
              <input
                id={`image-url-${img.id}`}
                type="url"
                className="garden-input-form__input"
                value={img.url}
                placeholder={t(
                  'gardenInput.form.resource_image_url_placeholder'
                )}
                onChange={(e) => onUpdateImage(img.id, { url: e.target.value })}
              />
            </div>
            <div className="garden-input-form__group">
              <label htmlFor={`image-title-${img.id}`}>
                {t('gardenInput.form.resource_title')}
              </label>
              <input
                id={`image-title-${img.id}`}
                type="text"
                className="garden-input-form__input"
                value={img.title}
                placeholder={t('gardenInput.form.resource_title_placeholder')}
                onChange={(e) =>
                  onUpdateImage(img.id, { title: e.target.value })
                }
              />
            </div>
            <div className="garden-input-form__group">
              <label htmlFor={`image-source-${img.id}`}>
                {t('gardenInput.form.resource_image_source')}
              </label>
              <input
                id={`image-source-${img.id}`}
                type="text"
                className="garden-input-form__input"
                value={img.source}
                placeholder={t(
                  'gardenInput.form.resource_image_source_placeholder'
                )}
                onChange={(e) =>
                  onUpdateImage(img.id, { source: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="garden-input-form__resource-remove-btn"
              onClick={() => onRemoveImage(img.id)}
              aria-label={`${t('gardenInput.form.resource_remove_image')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('gardenInput.form.resource_remove_image')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="garden-input-form__resource-add-btn"
          onClick={onAddImage}
        >
          <span>{t('gardenInput.form.resource_add_image')}</span>
        </button>
      </div>

      <div className="garden-input-form__resources-subgroup">
        <h3 className="garden-input-form__resources-subtitle">
          {t('gardenInput.form.resources_videos')}
        </h3>
        {videoResources.map((v, index) => (
          <div key={v.id} className="garden-input-form__resource-item">
            <div className="garden-input-form__group">
              <label htmlFor={`video-url-${v.id}`}>
                {t('gardenInput.form.resource_video_url')}
              </label>
              <input
                id={`video-url-${v.id}`}
                type="url"
                className="garden-input-form__input"
                value={v.url}
                placeholder={t(
                  'gardenInput.form.resource_video_url_placeholder'
                )}
                onChange={(e) => onUpdateVideo(v.id, { url: e.target.value })}
              />
            </div>
            <div className="garden-input-form__group">
              <label htmlFor={`video-title-${v.id}`}>
                {t('gardenInput.form.resource_title')}
              </label>
              <input
                id={`video-title-${v.id}`}
                type="text"
                className="garden-input-form__input"
                value={v.title}
                placeholder={t('gardenInput.form.resource_title_placeholder')}
                onChange={(e) => onUpdateVideo(v.id, { title: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="garden-input-form__resource-remove-btn"
              onClick={() => onRemoveVideo(v.id)}
              aria-label={`${t('gardenInput.form.resource_remove_video')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('gardenInput.form.resource_remove_video')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="garden-input-form__resource-add-btn"
          onClick={onAddVideo}
        >
          <span>{t('gardenInput.form.resource_add_video')}</span>
        </button>
      </div>

      <div className="garden-input-form__resources-subgroup">
        <h3 className="garden-input-form__resources-subtitle">
          {t('gardenInput.form.resources_articles')}
        </h3>
        {articleResources.map((a, index) => (
          <div key={a.id} className="garden-input-form__resource-item">
            <div className="garden-input-form__group">
              <label htmlFor={`article-url-${a.id}`}>
                {t('gardenInput.form.resource_article_url')}
              </label>
              <input
                id={`article-url-${a.id}`}
                type="url"
                className="garden-input-form__input"
                value={a.url}
                placeholder={t(
                  'gardenInput.form.resource_article_url_placeholder'
                )}
                onChange={(e) => onUpdateArticle(a.id, { url: e.target.value })}
              />
            </div>
            <div className="garden-input-form__group">
              <label htmlFor={`article-title-${a.id}`}>
                {t('gardenInput.form.resource_title')}
              </label>
              <input
                id={`article-title-${a.id}`}
                type="text"
                className="garden-input-form__input"
                value={a.title}
                placeholder={t('gardenInput.form.resource_title_placeholder')}
                onChange={(e) =>
                  onUpdateArticle(a.id, { title: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="garden-input-form__resource-remove-btn"
              onClick={() => onRemoveArticle(a.id)}
              aria-label={`${t('gardenInput.form.resource_remove_article')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('gardenInput.form.resource_remove_article')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="garden-input-form__resource-add-btn"
          onClick={onAddArticle}
        >
          <span>{t('gardenInput.form.resource_add_article')}</span>
        </button>
      </div>
    </fieldset>
  );
}
