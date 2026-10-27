import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { AuthContext } from '../../../shared/auth/authContextDef';
import { ErrorResponse } from '../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../shared/components/Loader/Loader';
import { NotFound } from '../../../shared/components/NotFound/NotFound';
import { SectionErrorBoundary } from '../../../shared/components/SectionErrorBoundary/SectionErrorBoundary';
import { getDetailViewState } from '../../../shared/reactQuery/detailViewState';
import { useGardenInput } from '../hooks/useGardenInput';
import { useGardenInputForEdit } from '../hooks/useGardenInputForEdit';
import GardenInputDeleteDialog from './components/GardenInputDeleteDialog';
import GardenInputEditModal from './components/GardenInputEditModal';
import GardenInputHero from './components/GardenInputHero';
import { GardenInputResources } from './components/GardenInputResources';
import RecipeCard from './components/RecipeCard';

import './gardenInputDetail.css';

export default function GardenInputDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isEditor = auth?.isEditor ?? false;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [prevSlug, setPrevSlug] = useState<string | undefined>(slug);

  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setIsEditing(false);
    setIsDeleteOpen(false);
  }

  const query = useGardenInput(slug);
  const forEditQuery = useGardenInputForEdit(slug, isEditor);
  const viewState = getDetailViewState(slug, query);
  const gardenInput = query.data;

  const resolveEtag = async () => {
    if (forEditQuery.data?.etag) {
      return forEditQuery.data.etag;
    }
    const refetched = await forEditQuery.refetch();
    return refetched.data?.etag;
  };

  if (viewState === 'notFound') {
    return (
      <NotFound
        titleKey="notFound.gardenInput.title"
        messageKey="notFound.gardenInput.message"
        backTo="/garden-inputs"
        backLabelKey="notFound.backToGardenInputs"
      />
    );
  }

  if (viewState === 'error') {
    return (
      <ErrorResponse error={query.error} onRetry={() => void query.refetch()} />
    );
  }

  if (!gardenInput) {
    return <Loader labelKey="gardenInput.detail.loading" />;
  }

  const recipes = gardenInput.recipes ?? [];
  const etag = forEditQuery.data?.etag ?? '';

  return (
    <article className="garden-input-detail">
      <SectionErrorBoundary section="gardenInput.hero">
        <GardenInputHero
          gardenInput={gardenInput}
          onEdit={isEditor ? () => setIsEditing(true) : undefined}
          onDelete={isEditor ? () => setIsDeleteOpen(true) : undefined}
        />
      </SectionErrorBoundary>

      <section className="garden-input-detail__recipes">
        <h2 className="garden-input-detail__recipes-heading">
          {t('gardenInput.detail.recipes_title')}
        </h2>

        {recipes.length === 0 ? (
          <p className="garden-input-detail__no-recipes">
            {t('gardenInput.detail.recipes_empty')}
          </p>
        ) : (
          <div className="garden-input-detail__recipes-list">
            {recipes.map((recipe, idx) => (
              <RecipeCard key={`${recipe.name}-${idx}`} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      <SectionErrorBoundary section="gardenInput.resources">
        <GardenInputResources resources={gardenInput.resources} />
      </SectionErrorBoundary>

      {isEditor && (
        <>
          <GardenInputEditModal
            isOpen={isEditing}
            gardenInput={gardenInput}
            etag={etag}
            resolveEtag={resolveEtag}
            onClose={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              void query.refetch();
              void forEditQuery.refetch();
            }}
            onReload={() => {
              void query.refetch();
              void forEditQuery.refetch();
            }}
          />

          <GardenInputDeleteDialog
            isOpen={isDeleteOpen}
            slug={gardenInput.slug}
            name={gardenInput.name}
            resolveEtag={resolveEtag}
            onClose={() => setIsDeleteOpen(false)}
            onDeleted={() => {
              setIsDeleteOpen(false);
              navigate('/garden-inputs');
            }}
            onReload={() => {
              void query.refetch();
              void forEditQuery.refetch();
            }}
          />
        </>
      )}
    </article>
  );
}
