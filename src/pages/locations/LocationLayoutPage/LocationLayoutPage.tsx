import type { JSX } from 'react';
import { useParams } from 'react-router-dom';

import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { ApiError } from '../../../shared/errors/ApiError';
import LocationLayoutView from './LocationLayoutView';
import { useLocationLayout } from './hooks/useLocationLayout';

import './locationLayoutPage.css';

function LayoutNotFound(): JSX.Element {
  return (
    <main className="location-layout-page">
      <NotFound
        titleKey="bed.layout.not_found_title"
        messageKey="bed.layout.not_found_description"
        backTo="/beds"
        backLabelKey="bed.layout.back_to_beds"
      />
    </main>
  );
}

export default function LocationLayoutPage(): JSX.Element {
  const { id = '' } = useParams<{ readonly id: string }>();
  const { query, etag } = useLocationLayout(id);

  if (!id) {
    return <LayoutNotFound />;
  }

  if (query.isLoading) {
    return (
      <main className="location-layout-page">
        <Loader labelKey="bed.layout.loading" />
      </main>
    );
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return <LayoutNotFound />;
    }
    return (
      <main className="location-layout-page">
        <ErrorResponse error={query.error} onRetry={() => query.refetch()} />
      </main>
    );
  }

  const layout = query.data?.layout;
  if (!layout) {
    return <LayoutNotFound />;
  }

  return <LocationLayoutView id={id} etag={etag} layout={layout} />;
}
