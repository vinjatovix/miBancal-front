import { t } from '../../../../i18n/core/t';
import BodySection from '../../../../shared/components/BodySection/BodySection';
import Icon from '../../../../shared/components/Icon/Icon';
import type { Plant } from '../../../../types/Plants/Plant';

import './plantNotes.css';

interface Props {
  readonly plant: Plant;
}

export default function PlantNotes({ plant }: Props) {
  const notes = plant.knowledge.notes ?? [];

  if (!notes.length) {
    return null;
  }

  return (
    <BodySection title={t('plant.notes.title')} icon="edit_note">
      <ul className="plant-list plant-list--notes">
        {notes.map((note) => (
          <li key={note}>
            <Icon name="edit_note" decorative /> {note}
          </li>
        ))}
      </ul>
    </BodySection>
  );
}
