import { lazy, Suspense, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { AuthContext } from '../../../shared/auth/authContextDef';
import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { SectionErrorBoundary } from '../../../shared/components/SectionErrorBoundary/SectionErrorBoundary';
import { PreconditionFailedError } from '../../../shared/errors/PreconditionFailedError';
import { getDetailViewState } from '../../../shared/reactQuery/detailViewState';

import { useDeletePlant } from '../hooks/useDeletePlant';
import { usePlant } from '../hooks/usePlant';
import { usePlantForEdit } from '../hooks/usePlantForEdit';
import { readPlantSafety } from '../utils/plantSafety';
import { useToast } from '../../../shared/toast/useToast';
import { PlantDeleteConfirmModal } from '../components/PlantDeleteConfirmModal/PlantDeleteConfirmModal';

import { PlantDetailStickyHeader } from './components/PlantDetailStickyHeader';
import PlantCalendar from './components/PlantCalendar';
import PlantCultivation from './components/PlantCultivation';
import PlantEcology from './components/PlantEcology';
import PlantHero from './components/PlantHero';
import PlantNotes from './components/PlantNotes';
import PlantResources from './components/PlantResources/PlantResources';
import PlantSafety from './components/PlantSafety';
import QuickFacts from './components/QuickFacts';

import './plantDetail.css';

const PlantInlineEditForm = lazy(() =>
  import('./components/PlantInlineEditForm').then((m) => ({
    default: m.PlantInlineEditForm
  }))
);

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;

  const [hemisphere, setHemisphere] = useState<'north' | 'south'>('north');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeleteConflict, setIsDeleteConflict] = useState<boolean>(false);
  const [prevId, setPrevId] = useState<string | undefined>(id);
  const { dismissAll, showErrorToast } = useToast();

  if (prevId !== id) {
    setPrevId(id);
    setIsEditing(false);
    setIsDeleteModalOpen(false);
    setIsDeleteConflict(false);
  }

  const plantQuery = usePlant(id);
  const plantForEditQuery = usePlantForEdit(id, isEditing || isEditor);
  const deleteMutation = useDeletePlant();
  const viewState = getDetailViewState(id, plantQuery);
  const plant = plantQuery.data;

  const handleOpenDeleteModal = () => {
    dismissAll();
    setIsDeleteConflict(false);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setIsDeleteModalOpen(false);
    setIsDeleteConflict(false);
  };

  const handleConfirmDelete = async () => {
    if (!plant) return;
    let etag = plantForEditQuery.data?.etag;
    if (!etag) {
      try {
        const refetched = await plantForEditQuery.refetch();
        etag = refetched.data?.etag;
      } catch {
        showErrorToast(t('errors.app.title'));
        return;
      }
    }
    if (!etag) {
      showErrorToast(t('errors.app.title'));
      return;
    }

    setIsDeleteConflict(false);

    try {
      await deleteMutation.mutateAsync({ id: plant.id, etag });
      setIsDeleteModalOpen(false);
      navigate('/plants');
    } catch (err: unknown) {
      if (err instanceof PreconditionFailedError) {
        setIsDeleteConflict(true);
      }
      showErrorToast(err);
    }
  };

  const handleReloadConflict = async () => {
    setIsDeleteConflict(false);
    await Promise.all([plantQuery.refetch(), plantForEditQuery.refetch()]);
  };

  if (viewState === 'notFound') {
    return (
      <NotFound
        titleKey="notFound.plant.title"
        messageKey="notFound.plant.message"
        backTo="/plants"
        backLabelKey="notFound.backToPlants"
      />
    );
  }

  if (!plant) {
    return viewState === 'error' ? (
      <ErrorResponse
        error={plantQuery.error}
        onRetry={() => void plantQuery.refetch()}
      />
    ) : (
      <Loader labelKey="plant.detail.loading" />
    );
  }

  if (isEditing) {
    if (!plantForEditQuery.data) {
      return plantForEditQuery.isError ? (
        <ErrorResponse
          error={plantForEditQuery.error}
          onRetry={() => void plantForEditQuery.refetch()}
        />
      ) : (
        <Loader labelKey="common.loading" />
      );
    }

    return (
      <div className="plant-detail">
        <SectionErrorBoundary section="plant.hero">
          <PlantDetailStickyHeader
            plant={plant ?? plantForEditQuery.data.plant}
            isEditing={true}
          />
        </SectionErrorBoundary>
        <Suspense fallback={<Loader labelKey="common.loading" />}>
          <PlantInlineEditForm
            key={plantForEditQuery.data.etag}
            plant={plantForEditQuery.data.plant}
            etag={plantForEditQuery.data.etag}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              void plantQuery.refetch();
            }}
            onReload={() => {
              void plantForEditQuery.refetch();
            }}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="plant-detail">
      <SectionErrorBoundary section="plant.hero">
        <PlantDetailStickyHeader
          plant={plant}
          onEdit={() => setIsEditing(true)}
          onDelete={handleOpenDeleteModal}
          isDeleting={deleteMutation.isPending}
          isEditing={false}
        />
        <PlantHero plant={plant} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.calendar">
        <PlantCalendar
          plant={plant}
          hemisphere={hemisphere}
          onHemisphereChange={setHemisphere}
        />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.quickFacts">
        <QuickFacts plant={plant} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.safety">
        <PlantSafety safety={readPlantSafety(plant)} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.cultivation">
        <PlantCultivation plant={plant} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.ecology">
        <PlantEcology plant={plant} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.notes">
        <PlantNotes plant={plant} />
      </SectionErrorBoundary>
      <SectionErrorBoundary section="plant.resources">
        <PlantResources plant={plant} />
      </SectionErrorBoundary>

      <PlantDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        plantName={plant.identity.name.primary}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        isDeleting={deleteMutation.isPending}
        isConflict={isDeleteConflict}
        onReload={handleReloadConflict}
      />
    </div>
  );
}
