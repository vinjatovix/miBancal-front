import type { JSX } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { Loader } from '../../../shared/components/Loader/Loader';
import { useBedDetail } from '../hooks/useBedDetail';

export default function BedDetailRedirect(): JSX.Element {
  const { id = '' } = useParams<{ readonly id: string }>();
  const { data: bed, isLoading } = useBedDetail(id);

  if (isLoading) {
    return (
      <main className="bed-detail-redirect">
        <Loader labelKey="bed.detail.loading" />
      </main>
    );
  }

  if (bed?.locationId) {
    return (
      <Navigate
        to={`/locations/${bed.locationId}/layout?bed=${bed.id}`}
        replace
      />
    );
  }

  return <Navigate to="/beds" replace />;
}
