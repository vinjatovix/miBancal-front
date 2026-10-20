import { t } from '../../../../i18n/core/t';
import type { PlantFormState } from './types';

interface Props {
  readonly values: PlantFormState;
  readonly errors: Record<string, string>;
  readonly onChange: <K extends keyof PlantFormState>(
    field: K,
    value: PlantFormState[K]
  ) => void;
}

export function PlantNotesSection({ values, errors, onChange }: Props) {
  const handleAddNote = () => {
    onChange('notes', [...values.notes, '']);
  };

  const handleNoteChange = (index: number, text: string) => {
    const updated = [...values.notes];
    updated[index] = text;
    onChange('notes', updated);
  };

  const handleRemoveNote = (index: number) => {
    const updated = values.notes.filter((_, i) => i !== index);
    onChange('notes', updated);
  };

  return (
    <fieldset className="plant-form__section">
      <legend className="plant-form__section-title">
        {t('plant.form.sections.notes')}
      </legend>

      {values.notes.length === 0 ? (
        <p className="plant-form__empty-text">{t('plant.form.notes.empty')}</p>
      ) : (
        <div className="plant-form__items-list">
          {values.notes.map((note, index) => {
            const errorKey = `note_${index}`;
            return (
              <div key={index} className="plant-form__item-card">
                <div className="plant-form__item-header">
                  <span className="plant-form__label">
                    {t('plant.form.notes.note_label', { n: index + 1 })}
                  </span>
                  <button
                    type="button"
                    className="plant-form__btn plant-form__btn--remove"
                    onClick={() => handleRemoveNote(index)}
                  >
                    {t('plant.form.notes.remove')}
                  </button>
                </div>
                <textarea
                  id={`plant-note-input-${index}`}
                  aria-label={t('plant.form.notes.note_label', {
                    n: index + 1
                  })}
                  className="plant-form__textarea"
                  rows={2}
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  placeholder={t('plant.form.notes.placeholder')}
                  aria-invalid={errors[errorKey] ? 'true' : 'false'}
                />
                {errors[errorKey] && (
                  <span role="alert" className="plant-form__error">
                    {errors[errorKey]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <button
          type="button"
          className="plant-form__btn plant-form__btn--add"
          onClick={handleAddNote}
        >
          {t('plant.form.notes.add')}
        </button>
      </div>
    </fieldset>
  );
}
