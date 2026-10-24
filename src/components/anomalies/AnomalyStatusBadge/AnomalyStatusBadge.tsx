import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import type { AnomalyStatus } from '../../../types/Anomaly/Anomaly';

interface Props {
  readonly status?: AnomalyStatus;
}

export default function AnomalyStatusBadge({ status }: Props) {
  if (status !== 'DELETED') {
    return null;
  }

  return (
    <Badge variant="deleted">{tValue('anomaly.statusValues', status)}</Badge>
  );
}
