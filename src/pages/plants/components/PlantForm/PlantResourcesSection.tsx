import { t } from '../../../../i18n/core/t';
import { ImageUrlFieldWithPreview } from './ImageUrlFieldWithPreview';
import type { PlantFormState } from './types';

interface Props {
  readonly values: PlantFormState;
  readonly errors: Record<string, string>;
  readonly onChange: <K extends keyof PlantFormState>(
    field: K,
    value: PlantFormState[K]
  ) => void;
}

export function PlantResourcesSection({ values, errors, onChange }: Props) {
  const handleAddVideo = () => {
    onChange('videoResources', [
      ...values.videoResources,
      { id: crypto.randomUUID(), url: '', title: '' }
    ]);
  };

  const handleVideoChange = (
    index: number,
    field: 'url' | 'title',
    value: string
  ) => {
    const updated = [...values.videoResources];
    updated[index] = { ...updated[index], [field]: value };
    onChange('videoResources', updated);
  };

  const handleRemoveVideo = (index: number) => {
    const updated = values.videoResources.filter((_, i) => i !== index);
    onChange('videoResources', updated);
  };

  const handleAddArticle = () => {
    onChange('articleResources', [
      ...values.articleResources,
      { id: crypto.randomUUID(), url: '', title: '' }
    ]);
  };

  const handleArticleChange = (
    index: number,
    field: 'url' | 'title',
    value: string
  ) => {
    const updated = [...values.articleResources];
    updated[index] = { ...updated[index], [field]: value };
    onChange('articleResources', updated);
  };

  const handleRemoveArticle = (index: number) => {
    const updated = values.articleResources.filter((_, i) => i !== index);
    onChange('articleResources', updated);
  };

  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.resources')}
      </legend>

      <ImageUrlFieldWithPreview
        label={t('plant.form.fields.image_url')}
        url={values.imageUrl}
        onChange={(url) => onChange('imageUrl', url)}
        error={errors.imageUrl}
        required
      />

      <div className="plant-form__field">
        <label htmlFor="image-title-input" className="plant-form__label">
          {t('plant.form.fields.image_title')}
        </label>
        <input
          id="image-title-input"
          type="text"
          className="plant-form__input"
          value={values.imageTitle}
          onChange={(e) => onChange('imageTitle', e.target.value)}
        />
      </div>

      <div className="plant-form__field">
        <label htmlFor="image-source-input" className="plant-form__label">
          {t('plant.form.fields.image_source')}
        </label>
        <input
          id="image-source-input"
          type="text"
          className="plant-form__input"
          value={values.imageSource}
          onChange={(e) => onChange('imageSource', e.target.value)}
        />
      </div>

      <div className="plant-form__subsection">
        <div className="plant-form__subsection-header">
          <h3 className="plant-form__label">
            {t('plant.form.resources.videos_title')}
          </h3>
          <button
            type="button"
            className="plant-form__btn plant-form__btn--add"
            onClick={handleAddVideo}
          >
            {t('plant.form.resources.add_video')}
          </button>
        </div>

        {values.videoResources.length === 0 ? (
          <p className="plant-form__empty-text">
            {t('plant.form.resources.empty_videos')}
          </p>
        ) : (
          <div className="plant-form__items-list">
            {values.videoResources.map((video, index) => {
              const errorKey = `videoUrl_${index}`;
              return (
                <div key={video.id} className="plant-form__item-card">
                  <div className="plant-form__item-header">
                    <span className="plant-form__label">
                      {t('plant.form.resources.videos_title')} #{index + 1}
                    </span>
                    <button
                      type="button"
                      className="plant-form__btn plant-form__btn--remove"
                      onClick={() => handleRemoveVideo(index)}
                    >
                      {t('plant.form.resources.remove_video')}
                    </button>
                  </div>
                  <div className="plant-form__field">
                    <label
                      htmlFor={`video-url-input-${video.id}`}
                      className="plant-form__label"
                    >
                      {t('plant.form.resources.video_url')}
                    </label>
                    <input
                      id={`video-url-input-${video.id}`}
                      type="url"
                      className="plant-form__input"
                      value={video.url}
                      onChange={(e) =>
                        handleVideoChange(index, 'url', e.target.value)
                      }
                      placeholder={t(
                        'plant.form.resources.video_url_placeholder'
                      )}
                      aria-invalid={errors[errorKey] ? 'true' : 'false'}
                    />
                    {errors[errorKey] && (
                      <span role="alert" className="plant-form__error">
                        {errors[errorKey]}
                      </span>
                    )}
                  </div>
                  <div className="plant-form__field">
                    <label
                      htmlFor={`video-title-input-${video.id}`}
                      className="plant-form__label"
                    >
                      {t('plant.form.resources.video_title')}
                    </label>
                    <input
                      id={`video-title-input-${video.id}`}
                      type="text"
                      className="plant-form__input"
                      value={video.title}
                      onChange={(e) =>
                        handleVideoChange(index, 'title', e.target.value)
                      }
                      placeholder={t(
                        'plant.form.resources.video_title_placeholder'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="plant-form__subsection">
        <div className="plant-form__subsection-header">
          <h3 className="plant-form__label">
            {t('plant.form.resources.articles_title')}
          </h3>
          <button
            type="button"
            className="plant-form__btn plant-form__btn--add"
            onClick={handleAddArticle}
          >
            {t('plant.form.resources.add_article')}
          </button>
        </div>

        {values.articleResources.length === 0 ? (
          <p className="plant-form__empty-text">
            {t('plant.form.resources.empty_articles')}
          </p>
        ) : (
          <div className="plant-form__items-list">
            {values.articleResources.map((article, index) => {
              const errorKey = `articleUrl_${index}`;
              return (
                <div key={article.id} className="plant-form__item-card">
                  <div className="plant-form__item-header">
                    <span className="plant-form__label">
                      {t('plant.form.resources.articles_title')} #{index + 1}
                    </span>
                    <button
                      type="button"
                      className="plant-form__btn plant-form__btn--remove"
                      onClick={() => handleRemoveArticle(index)}
                    >
                      {t('plant.form.resources.remove_article')}
                    </button>
                  </div>
                  <div className="plant-form__field">
                    <label
                      htmlFor={`article-url-input-${article.id}`}
                      className="plant-form__label"
                    >
                      {t('plant.form.resources.article_url')}
                    </label>
                    <input
                      id={`article-url-input-${article.id}`}
                      type="url"
                      className="plant-form__input"
                      value={article.url}
                      onChange={(e) =>
                        handleArticleChange(index, 'url', e.target.value)
                      }
                      placeholder={t(
                        'plant.form.resources.article_url_placeholder'
                      )}
                      aria-invalid={errors[errorKey] ? 'true' : 'false'}
                    />
                    {errors[errorKey] && (
                      <span role="alert" className="plant-form__error">
                        {errors[errorKey]}
                      </span>
                    )}
                  </div>
                  <div className="plant-form__field">
                    <label
                      htmlFor={`article-title-input-${article.id}`}
                      className="plant-form__label"
                    >
                      {t('plant.form.resources.article_title')}
                    </label>
                    <input
                      id={`article-title-input-${article.id}`}
                      type="text"
                      className="plant-form__input"
                      value={article.title}
                      onChange={(e) =>
                        handleArticleChange(index, 'title', e.target.value)
                      }
                      placeholder={t(
                        'plant.form.resources.article_title_placeholder'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </fieldset>
  );
}
