import { useState } from 'react';

import { t } from '../../../../i18n/core/t';
import {
  FormAddButton,
  FormRemoveButton
} from '../../../../shared/components/FormButtons';
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
  const [noteKeys, setNoteKeys] = useState<string[]>(() =>
    values.notes.map(() => crypto.randomUUID())
  );
  const [prevCount, setPrevCount] = useState(values.notes.length);

  if (values.notes.length !== prevCount) {
    setPrevCount(values.notes.length);
    const nextKeys = [...noteKeys];
    while (nextKeys.length < values.notes.length) {
      nextKeys.push(crypto.randomUUID());
    }
    setNoteKeys(nextKeys.slice(0, values.notes.length));
  }

  const handleAddNote = () => {
    setNoteKeys((prev) => [...prev, crypto.randomUUID()]);
    setPrevCount(values.notes.length + 1);
    onChange('notes', [...values.notes, '']);
  };

  const handleNoteChange = (index: number, text: string) => {
    const updated = [...values.notes];
    updated[index] = text;
    onChange('notes', updated);
  };

  const handleRemoveNote = (index: number) => {
    setNoteKeys((prev) => prev.filter((_, i) => i !== index));
    setPrevCount(values.notes.length - 1);
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
          {noteKeys.map((key, index) => {
            const note = values.notes[index] ?? '';
            const errorKey = `note_${index}`;
            return (
              <div key={key} className="plant-form__item-card">
                <div className="plant-form__item-header">
                  <span className="plant-form__label">
                    {t('plant.form.notes.note_label', { n: index + 1 })}
                  </span>
                  <FormRemoveButton
                    onClick={() => handleRemoveNote(index)}
                    ariaLabel={t('plant.form.notes.remove')}
                    label={t('plant.form.notes.remove')}
                  />
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
        <FormAddButton
          onClick={handleAddNote}
          label={t('plant.form.notes.add')}
        />
      </div>
    </fieldset>
  );
}
