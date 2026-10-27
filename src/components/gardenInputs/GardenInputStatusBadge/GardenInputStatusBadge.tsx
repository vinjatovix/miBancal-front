import { tValue } from '../../../i18n/core/tValue';
import Badge from '../../../shared/components/Badge/Badge';
import type { GardenInputStatus } from '../../../types/GardenInput/GardenInput';

export interface GardenInputStatusBadgeProps {
  readonly status?: GardenInputStatus;
}

export default function GardenInputStatusBadge({
  status
}: GardenInputStatusBadgeProps) {
  if (status !== 'deleted') {
    return null;
  }

  return (
    <Badge variant="deleted">
      {tValue('gardenInput.statusValues', status)}
    </Badge>
  );
}
