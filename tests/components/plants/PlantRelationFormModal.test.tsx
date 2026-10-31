import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantRelationFormModal from '../../../src/components/plants/PlantRelationFormModal/PlantRelationFormModal';
import { useCreatePlantRelation } from '../../../src/pages/plantRelations/hooks/useCreatePlantRelation';
import { useUpdatePlantRelation } from '../../../src/pages/plantRelations/hooks/useUpdatePlantRelation';
import { PreconditionFailedError } from '../../../src/shared/errors/PreconditionFailedError';
import { listPlantsResponse } from '../../fixtures/plants/listPlants';
import {
  buildPlantRelation,
  buildTargetPlantSummary
} from '../../fixtures/plantRelations/buildPlantRelation';

vi.mock(
  '../../../src/pages/plantRelations/hooks/useCreatePlantRelation',
  () => ({
    useCreatePlantRelation: vi.fn()
  })
);
vi.mock(
  '../../../src/pages/plantRelations/hooks/useUpdatePlantRelation',
  () => ({
    useUpdatePlantRelation: vi.fn()
  })
);
vi.mock('../../../src/pages/plantRelations/hooks/usePlantSearch', () => ({
  usePlantSearch: vi.fn(() => ({
    data: listPlantsResponse,
    isLoading: false
  }))
}));

const mockedUseCreate = vi.mocked(useCreatePlantRelation);
const mockedUseUpdate = vi.mocked(useUpdatePlantRelation);

const BASE_PLANT_ID = '11111111-1111-4111-8111-111111111111';
const mockRelation = buildPlantRelation({ sourcePlantId: BASE_PLANT_ID });

describe('PlantRelationFormModal', () => {
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCreate.mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useCreatePlantRelation>);
    mockedUseUpdate.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof useUpdatePlantRelation>);
  });

  it('renders create modal with form fields', () => {
    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Nueva asociación botánica')).toBeInTheDocument();
    expect(screen.getByText('Planta compañera')).toBeInTheDocument();
    expect(screen.getByText('Dirección del efecto')).toBeInTheDocument();
    expect(screen.getByText('Mecanismo botánico')).toBeInTheDocument();
  });

  it('submits create form when companion and reason are provided', async () => {
    mockCreateMutateAsync.mockResolvedValue({
      relation: mockRelation,
      etag: '"v1"'
    });
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    const combobox = screen.getByRole('combobox', {
      name: 'Buscar planta en el catálogo'
    });
    await user.type(combobox, 'tom');
    const option = await screen.findByRole('option', {
      name: new RegExp(listPlantsResponse.data[0].identity.name.primary, 'i')
    });
    await user.click(option);

    const reasonInput = screen.getByPlaceholderText(
      /Describe la interacción botánica/
    );
    await user.type(reasonInput, 'Sinergia demostrada');

    const submitBtn = screen.getByRole('button', { name: 'Guardar relación' });
    await user.click(submitBtn);

    expect(mockCreateMutateAsync).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('renders edit modal with prefilled reason and calls update on submit', async () => {
    mockUpdateMutateAsync.mockResolvedValue({
      relation: mockRelation,
      etag: '"v2"'
    });
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={mockRelation}
        etag='"v1"'
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('Editar asociación botánica')).toBeInTheDocument();
    expect(screen.queryByText('Planta compañera')).not.toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: 'Guardar relación' });
    await user.click(submitBtn);

    expect(mockUpdateMutateAsync).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('synchronizes form state when opening an existing relation after initial mount', () => {
    const existingRelation = buildPlantRelation({
      sourcePlantId: BASE_PLANT_ID,
      reason: 'Asociación previa guardada'
    });

    const { rerender } = render(
      <PlantRelationFormModal
        isOpen={false}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={null}
        onClose={vi.fn()}
      />
    );

    rerender(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={existingRelation}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByDisplayValue('Asociación previa guardada')
    ).toBeInTheDocument();
  });

  it('displays companion plant name in subtitle when editing', () => {
    const targetPlant = buildTargetPlantSummary({
      name: { primary: 'Albahaca' }
    });
    const relationWithTarget = buildPlantRelation({
      sourcePlantId: BASE_PLANT_ID,
      targetPlant
    });

    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={relationWithTarget}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Albahaca')).toBeInTheDocument();
  });

  it('displays validation error and halts submit when minimum distance exceeds maximum distance', async () => {
    const user = userEvent.setup();

    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={mockRelation}
        onClose={vi.fn()}
      />
    );

    const minInput = screen.getByLabelText(/Distancia mínima/);
    const maxInput = screen.getByLabelText(/Distancia máxima/);
    await user.clear(minInput);
    await user.type(minInput, '80');
    await user.clear(maxInput);
    await user.type(maxInput, '20');

    const submitBtn = screen.getByRole('button', { name: 'Guardar relación' });
    await user.click(submitBtn);

    expect(
      screen.getByText(
        'Por favor, revisa los datos introducidos en el formulario.'
      )
    ).toBeInTheDocument();
    expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
  });

  it('displays concurrent modification message on PreconditionFailedError during update', async () => {
    mockUpdateMutateAsync.mockRejectedValue(new PreconditionFailedError());
    const user = userEvent.setup();

    render(
      <PlantRelationFormModal
        isOpen={true}
        basePlantId={BASE_PLANT_ID}
        relationToEdit={mockRelation}
        onClose={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar relación' });
    await user.click(submitBtn);

    expect(
      await screen.findByText(
        'El registro ha sido modificado por otro usuario. Recarga la página para ver los cambios más recientes.'
      )
    ).toBeInTheDocument();
  });
});
