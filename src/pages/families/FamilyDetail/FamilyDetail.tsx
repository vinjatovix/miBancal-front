import { lazy, startTransition, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { SectionErrorBoundary } from '../../../shared/components/SectionErrorBoundary/SectionErrorBoundary';
import { getDetailViewState } from '../../../shared/reactQuery/detailViewState';

import { useFamily } from '../hooks/useFamily';
import { useFamilyForEdit } from '../hooks/useFamilyForEdit';
import { useFamilyPlants } from '../hooks/useFamilyPlants';

import { FamilyHero } from './components/FamilyHero';
import FamilyInfo from './components/FamilyInfo';
import FamilyPlants from './components/FamilyPlants';

import './familyDetail.css';

const FamilyInlineEditForm = lazy(() =>
  import('./components/FamilyInlineEditForm').then((m) => ({
    default: m.FamilyInlineEditForm
  }))
);

export default function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [prevId, setPrevId] = useState<string | undefined>(id);

  if (prevId !== id) {
    setPrevId(id);
    if (isEditing) {
      setIsEditing(false);
    }
  }

  const familyQuery = useFamily(id);
  const familyForEditQuery = useFamilyForEdit(id, isEditing);
  const plantsQuery = useFamilyPlants(familyQuery.data?.id);
  const viewState = getDetailViewState(id, familyQuery);
  const family = familyQuery.data;

  if (viewState === 'notFound') {
    return (
      <NotFound
        titleKey="notFound.family.title"
        messageKey="notFound.family.message"
        backTo="/families"
        backLabelKey="notFound.backToFamilies"
      />
    );
  }

  if (isEditing) {
    if (!familyForEditQuery.data) {
      return familyForEditQuery.isError ? (
        <ErrorResponse
          error={familyForEditQuery.error}
          onRetry={() => void familyForEditQuery.refetch()}
        />
      ) : (
        <Loader labelKey="common.loading" />
      );
    }

    return (
      <div className="family-detail">
        <SectionErrorBoundary section="family.hero">
          <FamilyHero
            family={family ?? familyForEditQuery.data.family}
            isEditing={true}
          />
        </SectionErrorBoundary>
        <Suspense fallback={<Loader labelKey="common.loading" />}>
          <FamilyInlineEditForm
            key={familyForEditQuery.data.etag}
            family={familyForEditQuery.data.family}
            etag={familyForEditQuery.data.etag}
            onCancel={() => setIsEditing(false)}
            onSuccess={(updated) => {
              const nextIdOrSlug = updated.slug || updated.id;
              if (id !== nextIdOrSlug) {
                startTransition(() => {
                  setIsEditing(false);
                  navigate(`/families/${nextIdOrSlug}`, { replace: true });
                });
              } else {
                setIsEditing(false);
                void familyQuery.refetch();
              }
            }}
            onReload={() => {
              void familyForEditQuery.refetch();
            }}
          />
        </Suspense>
      </div>
    );
  }

  if (family) {
    return (
      <div className="family-detail">
        <SectionErrorBoundary section="family.hero">
          <FamilyHero
            family={family}
            onEdit={() => setIsEditing(true)}
            isEditing={false}
          />
        </SectionErrorBoundary>
        <SectionErrorBoundary section="family.info">
          <FamilyInfo family={family} />
        </SectionErrorBoundary>
        <SectionErrorBoundary section="family.plants">
          <FamilyPlants family={family} query={plantsQuery} />
        </SectionErrorBoundary>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <ErrorResponse
        error={familyQuery.error}
        onRetry={() => void familyQuery.refetch()}
      />
    );
  }

  return <Loader labelKey="family.detail.loading" />;
}
