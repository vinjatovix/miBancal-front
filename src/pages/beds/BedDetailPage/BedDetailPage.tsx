import type { JSX } from 'react';
import { useParams } from 'react-router-dom';

import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { useBedDetail } from '../hooks/useBedDetail';
import BedPlacementEditor from './BedPlacementEditor';

import './bedDetailPage.css';

export default function BedDetailPage(): JSX.Element {
  const { id = '' } = useParams<{ readonly id: string }>();
  const { data: bed, isLoading } = useBedDetail(id);

  if (isLoading) {
    return (
      <main className="bed-detail-page bed-detail-page--loading">
        <Loader labelKey="bed.detail.loading" />
      </main>
    );
  }

  if (!bed) {
    return (
      <NotFound
        titleKey="bed.detail.not_found_title"
        messageKey="bed.detail.not_found_description"
        backTo="/beds"
        backLabelKey="bed.detail.back_to_list"
      />
    );
  }

  return <BedPlacementEditor bed={bed} />;
}
