import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantRelationDeleteDialog from '../../../src/components/plants/PlantRelationDeleteDialog/PlantRelationDeleteDialog';
import { useDeletePlantRelation } from '../../../src/pages/plantRelations/hooks/useDeletePlantRelation';
import { PreconditionFailedError } from '../../../src/shared/errors/PreconditionFailedError';
import { buildPlantRelation } from '../../fixtures/plantRelations/buildPlantRelation';

vi.mock(
  '../../../src/pages/plantRelations/hooks/useDeletePlantRelation',
  () => ({
    useDeletePlantRelation: vi.fn()
  })
);

const mockedUseDelete = vi.mocked(useDeletePlantRelation);
const mockRelation = buildPlantRelation();

describe('PlantRelationDeleteDialog', () => {
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseDelete.mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useDeletePlantRelation>);
  });

  it('renders confirmation prompt when open with a relation', () => {
    render(
      <PlantRelationDeleteDialog
        isOpen={true}
        relation={mockRelation}
        etag='"v1"'
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByText('¿Eliminar relación botánica?')
    ).toBeInTheDocument();
  });

  it('calls delete mutation when confirmed', async () => {
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <PlantRelationDeleteDialog
        isOpen={true}
        relation={mockRelation}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(confirmBtn);

    expect(mockDeleteMutateAsync).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('displays concurrent modification message on PreconditionFailedError', async () => {
    mockDeleteMutateAsync.mockRejectedValue(new PreconditionFailedError());
    const user = userEvent.setup();

    render(
      <PlantRelationDeleteDialog
        isOpen={true}
        relation={mockRelation}
        etag='"v1"'
        onClose={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Eliminar' });
    await user.click(confirmBtn);

    expect(
      await screen.findByText(
        'El registro ha sido modificado por otro usuario. Recarga la página para ver los cambios más recientes.'
      )
    ).toBeInTheDocument();
  });
});
