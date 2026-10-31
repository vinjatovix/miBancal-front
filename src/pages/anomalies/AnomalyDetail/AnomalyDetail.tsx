import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { SectionErrorBoundary } from '../../../shared/components/SectionErrorBoundary/SectionErrorBoundary';
import { AuthContext } from '../../../shared/auth/authContextDef';
import { getDetailViewState } from '../../../shared/reactQuery/detailViewState';
import { useAnomaly } from '../hooks/useAnomaly';
import { useAnomalyForEdit } from '../hooks/useAnomalyForEdit';

import { AnomalyDeleteDialog } from './components/AnomalyDeleteDialog';
import { AnomalyHero } from './components/AnomalyHero';
import { AnomalyInlineEditForm } from './components/AnomalyInlineEditForm';
import { AnomalySections } from './components/AnomalySections';
import { AnomalyConfusedWith } from './components/AnomalyConfusedWith';
import { AnomalyResources } from './components/AnomalyResources';

import './anomalyDetail.css';

export default function AnomalyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditor = useContext(AuthContext)?.isEditor ?? false;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [prevSlug, setPrevSlug] = useState<string | undefined>(slug);

  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setIsEditing(false);
    setIsDeleteOpen(false);
  }

  const anomalyQuery = useAnomaly(slug);
  const forEditQuery = useAnomalyForEdit(slug, isEditing || isEditor);
  const viewState = getDetailViewState(slug, anomalyQuery);
  const anomaly = anomalyQuery.data;

  const reload = () => {
    void anomalyQuery.refetch();
    void forEditQuery.refetch();
  };

  const resolveEtag = async () =>
    forEditQuery.data?.etag ?? (await forEditQuery.refetch()).data?.etag;

  if (viewState === 'notFound') {
    return (
      <NotFound
        titleKey="notFound.anomaly.title"
        messageKey="notFound.anomaly.message"
        backTo="/anomalies"
        backLabelKey="notFound.backToAnomalies"
      />
    );
  }

  if (isEditing) {
    if (!forEditQuery.data) {
      return forEditQuery.isError ? (
        <ErrorResponse
          error={forEditQuery.error}
          onRetry={() => void forEditQuery.refetch()}
        />
      ) : (
        <Loader labelKey="common.loading" />
      );
    }

    return (
      <div className="anomaly-detail">
        <SectionErrorBoundary section="anomaly.hero">
          <AnomalyHero anomaly={anomaly ?? forEditQuery.data.anomaly} />
        </SectionErrorBoundary>
        <AnomalyInlineEditForm
          key={forEditQuery.data.etag}
          anomaly={forEditQuery.data.anomaly}
          etag={forEditQuery.data.etag}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            void anomalyQuery.refetch();
          }}
          onReload={reload}
        />
      </div>
    );
  }

  if (anomaly) {
    return (
      <div className="anomaly-detail">
        <SectionErrorBoundary section="anomaly.hero">
          <AnomalyHero
            anomaly={anomaly}
            onEdit={() => setIsEditing(true)}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </SectionErrorBoundary>
        <SectionErrorBoundary section="anomaly.confusedWith">
          <AnomalyConfusedWith slugs={anomaly.confusedWith} />
        </SectionErrorBoundary>
        <SectionErrorBoundary section="anomaly.sections">
          <AnomalySections anomaly={anomaly} />
        </SectionErrorBoundary>
        <SectionErrorBoundary section="anomaly.resources">
          <AnomalyResources resources={anomaly.resources} />
        </SectionErrorBoundary>
        <AnomalyDeleteDialog
          isOpen={isDeleteOpen}
          slug={anomaly.slug}
          name={anomaly.name}
          resolveEtag={resolveEtag}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={() => navigate('/anomalies')}
          onReload={() => {
            setIsDeleteOpen(false);
            reload();
          }}
        />
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <ErrorResponse
        error={anomalyQuery.error}
        onRetry={() => void anomalyQuery.refetch()}
      />
    );
  }

  return <Loader labelKey="anomaly.detail.loading" />;
}
