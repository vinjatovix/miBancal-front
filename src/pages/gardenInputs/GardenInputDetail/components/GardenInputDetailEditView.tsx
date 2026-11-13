import { ErrorResponse } from '../../../../shared/components/ErrorResponse/ErrorResponse';
import { Loader } from '../../../../shared/components/Loader/Loader';
import { SectionErrorBoundary } from '../../../../shared/components/SectionErrorBoundary/SectionErrorBoundary';
import { reportRejection } from '../../../../shared/observability/reportRejection';
import type { GardenInput } from '../../../../types/GardenInput/GardenInput';
import type { useGardenInputForEdit } from '../../hooks/useGardenInputForEdit';
import { GardenInputDetailStickyHeader } from './GardenInputDetailStickyHeader';
import { GardenInputInlineEditForm } from './GardenInputInlineEditForm';

export interface GardenInputDetailEditViewProps {
  readonly fallbackGardenInput: GardenInput;
  readonly forEditQuery: ReturnType<typeof useGardenInputForEdit>;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}

export function GardenInputDetailEditView({
  fallbackGardenInput,
  forEditQuery,
  onCancel,
  onSuccess
}: GardenInputDetailEditViewProps) {
  if (!forEditQuery.data) {
    if (forEditQuery.isError) {
      return (
        <ErrorResponse
          error={forEditQuery.error}
          onRetry={() => {
            forEditQuery
              .refetch()
              .catch(reportRejection('garden-input-detail'));
          }}
        />
      );
    }
    return <Loader labelKey="common.loading" />;
  }

  const { gardenInput, etag } = forEditQuery.data;

  return (
    <div className="garden-input-detail">
      <SectionErrorBoundary section="gardenInput.hero">
        <GardenInputDetailStickyHeader
          gardenInput={fallbackGardenInput ?? gardenInput}
          isEditing={true}
        />
      </SectionErrorBoundary>
      <GardenInputInlineEditForm
        gardenInput={gardenInput}
        etag={etag}
        onCancel={onCancel}
        onSuccess={onSuccess}
        onReload={() => {
          forEditQuery.refetch().catch(reportRejection('garden-input-detail'));
        }}
      />
    </div>
  );
}
