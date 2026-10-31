import { t } from '../../../../i18n/core/t';
import Icon from '../../../../shared/components/Icon/Icon';
import type {
  ArticleResourceFormItem,
  ImageResourceFormItem,
  VideoResourceFormItem
} from './types';

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

export function AnomalyResourcesSection({
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
    <fieldset className="anomaly-form__section">
      <legend>{t('anomaly.form.sections.resources')}</legend>

      {error && (
        <p className="anomaly-form__field-error" role="alert">
          {error}
        </p>
      )}

      <div className="anomaly-form__subgroup">
        <h3>{t('anomaly.form.sections.images')}</h3>
        {images.map((img, index) => (
          <div key={img.id} className="anomaly-form__resource-item">
            {img.url.trim() !== '' && (
              <img
                src={img.url}
                alt=""
                className="anomaly-form__img-preview"
                loading="lazy"
              />
            )}
            <div className="anomaly-form__field">
              <label htmlFor={`image-url-${img.id}`}>
                {t('anomaly.form.fields.image_url')}
              </label>
              <input
                id={`image-url-${img.id}`}
                type="url"
                value={img.url}
                placeholder={t('anomaly.form.fields.image_url_placeholder')}
                onChange={(e) => onUpdateImage(img.id, { url: e.target.value })}
              />
            </div>
            <div className="anomaly-form__field">
              <label htmlFor={`image-title-${img.id}`}>
                {t('anomaly.form.fields.image_title')}
              </label>
              <input
                id={`image-title-${img.id}`}
                type="text"
                value={img.title}
                placeholder={t('anomaly.form.fields.image_title_placeholder')}
                onChange={(e) =>
                  onUpdateImage(img.id, { title: e.target.value })
                }
              />
            </div>
            <div className="anomaly-form__field">
              <label htmlFor={`image-source-${img.id}`}>
                {t('anomaly.form.fields.image_source')}
              </label>
              <input
                id={`image-source-${img.id}`}
                type="text"
                value={img.source}
                placeholder={t('anomaly.form.fields.image_source_placeholder')}
                onChange={(e) =>
                  onUpdateImage(img.id, { source: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="anomaly-form__remove-btn"
              onClick={() => onRemoveImage(img.id)}
              aria-label={`${t('anomaly.form.fields.remove_image')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('anomaly.form.fields.remove_image')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="anomaly-form__add-btn"
          onClick={onAddImage}
        >
          <span>{t('anomaly.form.fields.add_image')}</span>
        </button>
      </div>

      <div className="anomaly-form__subgroup">
        <h3>{t('anomaly.form.sections.videos')}</h3>
        {videoResources.map((v, index) => (
          <div key={v.id} className="anomaly-form__resource-item">
            <div className="anomaly-form__field">
              <label htmlFor={`video-url-${v.id}`}>
                {t('anomaly.form.fields.video_url')}
              </label>
              <input
                id={`video-url-${v.id}`}
                type="url"
                value={v.url}
                placeholder={t('anomaly.form.fields.video_url_placeholder')}
                onChange={(e) => onUpdateVideo(v.id, { url: e.target.value })}
              />
            </div>
            <div className="anomaly-form__field">
              <label htmlFor={`video-title-${v.id}`}>
                {t('anomaly.form.fields.video_title')}
              </label>
              <input
                id={`video-title-${v.id}`}
                type="text"
                value={v.title}
                placeholder={t('anomaly.form.fields.video_title_placeholder')}
                onChange={(e) => onUpdateVideo(v.id, { title: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="anomaly-form__remove-btn"
              onClick={() => onRemoveVideo(v.id)}
              aria-label={`${t('anomaly.form.fields.remove_video')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('anomaly.form.fields.remove_video')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="anomaly-form__add-btn"
          onClick={onAddVideo}
        >
          <span>{t('anomaly.form.fields.add_video')}</span>
        </button>
      </div>

      <div className="anomaly-form__subgroup">
        <h3>{t('anomaly.form.sections.articles')}</h3>
        {articleResources.map((a, index) => (
          <div key={a.id} className="anomaly-form__resource-item">
            <div className="anomaly-form__field">
              <label htmlFor={`article-url-${a.id}`}>
                {t('anomaly.form.fields.article_url')}
              </label>
              <input
                id={`article-url-${a.id}`}
                type="url"
                value={a.url}
                placeholder={t('anomaly.form.fields.article_url_placeholder')}
                onChange={(e) => onUpdateArticle(a.id, { url: e.target.value })}
              />
            </div>
            <div className="anomaly-form__field">
              <label htmlFor={`article-title-${a.id}`}>
                {t('anomaly.form.fields.article_title')}
              </label>
              <input
                id={`article-title-${a.id}`}
                type="text"
                value={a.title}
                placeholder={t('anomaly.form.fields.article_title_placeholder')}
                onChange={(e) =>
                  onUpdateArticle(a.id, { title: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="anomaly-form__remove-btn"
              onClick={() => onRemoveArticle(a.id)}
              aria-label={`${t('anomaly.form.fields.remove_article')} ${index + 1}`}
            >
              <Icon name="delete" decorative />
              <span>{t('anomaly.form.fields.remove_article')}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="anomaly-form__add-btn"
          onClick={onAddArticle}
        >
          <span>{t('anomaly.form.fields.add_article')}</span>
        </button>
      </div>
    </fieldset>
  );
}
