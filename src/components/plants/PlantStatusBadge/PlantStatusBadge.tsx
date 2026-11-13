import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import type { PlantStatus } from '../../../types/Plants/Plant';

interface Props {
  readonly status?: PlantStatus;
}

export default function PlantStatusBadge({ status }: Props) {
  if (status !== 'DELETED') {
    return null;
  }

  return (
    <Badge variant="deleted">{tValue('plant.statusValues', status)}</Badge>
  );
}
