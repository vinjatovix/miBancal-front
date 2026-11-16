import { t } from '../../../../i18n/core/t';
import { tValue } from '../../../../i18n/core/tValue';
import {
  ANOMALY_CATEGORIES,
  ANOMALY_TEXT_LIST_FIELDS
} from '../../../../types/Anomaly/Anomaly';
import { AnomalyConfusedWithSection } from './AnomalyConfusedWithSection';
import { FieldError, TextArea, TextInput } from './AnomalyFormControls';
import { AnomalyResourcesSection } from './AnomalyResourcesSection';
import {
  LIST_LABEL_KEYS,
  LIST_PLACEHOLDER_KEYS
} from './utils/anomalyTextListKeys';
import type {
  AnomalyFormMode,
  AnomalyFormState,
  ArticleResourceFormItem,
  ImageResourceFormItem,
  VideoResourceFormItem
} from './types';

interface Props {
  readonly mode: AnomalyFormMode;
  readonly values: AnomalyFormState;
  readonly errors: Record<string, string>;
  readonly setField: <K extends keyof AnomalyFormState>(
    field: K,
    value: AnomalyFormState[K]
  ) => void;
}

export function AnomalyFormFields({ mode, values, errors, setField }: Props) {
  const isCreate = mode === 'create';

  const handleAddImage = () =>
    setField('images', [
      ...values.images,
      { id: crypto.randomUUID(), url: '', title: '', source: '' }
    ]);

  const handleUpdateImage = (
    id: string,
    patch: Partial<Omit<ImageResourceFormItem, 'id'>>
  ) =>
    setField(
      'images',
      values.images.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );

  const handleRemoveImage = (id: string) =>
    setField(
      'images',
      values.images.filter((i) => i.id !== id)
    );

  const handleAddVideo = () =>
    setField('videoResources', [
      ...values.videoResources,
      { id: crypto.randomUUID(), url: '', title: '' }
    ]);

  const handleUpdateVideo = (
    id: string,
    patch: Partial<Omit<VideoResourceFormItem, 'id'>>
  ) =>
    setField(
      'videoResources',
      values.videoResources.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );

  const handleRemoveVideo = (id: string) =>
    setField(
      'videoResources',
      values.videoResources.filter((v) => v.id !== id)
    );

  const handleAddArticle = () =>
    setField('articleResources', [
      ...values.articleResources,
      { id: crypto.randomUUID(), url: '', title: '' }
    ]);

  const handleUpdateArticle = (
    id: string,
    patch: Partial<Omit<ArticleResourceFormItem, 'id'>>
  ) =>
    setField(
      'articleResources',
      values.articleResources.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );

  const handleRemoveArticle = (id: string) =>
    setField(
      'articleResources',
      values.articleResources.filter((a) => a.id !== id)
    );

  return (
    <>
      <TextInput
        id="anomaly-name-input"
        label={t('anomaly.form.fields.name')}
        value={values.name}
        error={errors.name}
        placeholder={t('anomaly.form.fields.name_placeholder')}
        required
        onChange={(value) => setField('name', value)}
      />

      <TextInput
        id="anomaly-slug-input"
        label={t('anomaly.form.fields.slug')}
        value={values.slug}
        error={errors.slug}
        placeholder={t('anomaly.form.fields.slug_placeholder')}
        hint={t(
          isCreate
            ? 'anomaly.form.fields.slug_hint'
            : 'anomaly.form.fields.slug_locked_hint'
        )}
        required={isCreate}
        disabled={!isCreate}
        onChange={(value) => setField('slug', value)}
      />

      <div className="anomaly-form__field">
        <label htmlFor="anomaly-category-input" className="anomaly-form__label">
          {t('anomaly.form.fields.category')}
          <span aria-hidden="true"> *</span>
        </label>
        <select
          id="anomaly-category-input"
          className="anomaly-form__input"
          value={values.category}
          onChange={(e) =>
            setField('category', e.target.value as AnomalyFormState['category'])
          }
          aria-invalid={errors.category ? 'true' : 'false'}
        >
          <option value="">
            {t('anomaly.form.fields.category_placeholder')}
          </option>
          {ANOMALY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {tValue('anomaly.categoryValues', category)}
            </option>
          ))}
        </select>
        <FieldError message={errors.category} />
      </div>

      <TextInput
        id="anomaly-scientific-name-input"
        label={t('anomaly.form.fields.scientific_name')}
        value={values.scientificName}
        error={errors.scientificName}
        placeholder={t('anomaly.form.fields.scientific_name_placeholder')}
        onChange={(value) => setField('scientificName', value)}
      />

      <TextArea
        id="anomaly-description-input"
        label={t('anomaly.form.fields.description')}
        value={values.description}
        error={errors.description}
        placeholder={t('anomaly.form.fields.description_placeholder')}
        onChange={(value) => setField('description', value)}
      />

      {ANOMALY_TEXT_LIST_FIELDS.map((field) => (
        <TextArea
          key={field}
          id={`anomaly-${field}-input`}
          label={t(LIST_LABEL_KEYS[field])}
          value={values[field]}
          error={errors[field]}
          placeholder={t(LIST_PLACEHOLDER_KEYS[field])}
          onChange={(value) => setField(field, value)}
        />
      ))}

      <AnomalyConfusedWithSection
        value={values.confusedWithInput}
        error={errors.confusedWith}
        onChange={(value) => setField('confusedWithInput', value)}
      />

      <AnomalyResourcesSection
        images={values.images}
        videoResources={values.videoResources}
        articleResources={values.articleResources}
        onAddImage={handleAddImage}
        onUpdateImage={handleUpdateImage}
        onRemoveImage={handleRemoveImage}
        onAddVideo={handleAddVideo}
        onUpdateVideo={handleUpdateVideo}
        onRemoveVideo={handleRemoveVideo}
        onAddArticle={handleAddArticle}
        onUpdateArticle={handleUpdateArticle}
        onRemoveArticle={handleRemoveArticle}
        error={errors.resources}
      />
    </>
  );
}
