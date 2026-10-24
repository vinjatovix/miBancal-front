import type {
  AnomalyCategory,
  AnomalyTextListField
} from '../../../../types/Anomaly/Anomaly';

type AnomalyFormTextLists = {
  [Field in AnomalyTextListField]: string;
};

export interface AnomalyFormState extends AnomalyFormTextLists {
  slug: string;
  name: string;
  scientificName: string;
  category: AnomalyCategory | '';
  description: string;
}

export type AnomalyFormMode = 'create' | 'edit';

export const ANOMALY_NAME_MAX_LENGTH = 200;
export const ANOMALY_TEXT_MAX_LENGTH = 2000;
