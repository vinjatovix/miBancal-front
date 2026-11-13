import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlantNotesSection } from '../../../../../src/pages/plants/components/PlantForm/PlantNotesSection';
import { initialPlantFormState } from '../../../../../src/pages/plants/components/PlantForm/utils/plantFormMappers';

describe('PlantNotesSection', () => {
  it('renders empty message when no notes exist', () => {
    const values = initialPlantFormState();

    render(
      <PlantNotesSection values={values} errors={{}} onChange={vi.fn()} />
    );

    expect(
      screen.getByText('No hay notas añadidas para esta planta.')
    ).toBeInTheDocument();
  });

  it('calls onChange with new empty note when add button is clicked', async () => {
    const user = userEvent.setup();
    const values = initialPlantFormState();
    const onChange = vi.fn();

    render(
      <PlantNotesSection values={values} errors={{}} onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Añadir nota' }));

    expect(onChange).toHaveBeenCalledWith('notes', ['']);
  });

  it('renders existing notes list', () => {
    const values = {
      ...initialPlantFormState(),
      notes: ['Nota 1', 'Nota 2']
    };

    render(
      <PlantNotesSection values={values} errors={{}} onChange={vi.fn()} />
    );

    expect(screen.getByDisplayValue('Nota 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Nota 2')).toBeInTheDocument();
  });

  it('calls onChange with updated text when editing note', async () => {
    const user = userEvent.setup();
    const values = {
      ...initialPlantFormState(),
      notes: ['Nota inicial']
    };
    const onChange = vi.fn();

    render(
      <PlantNotesSection values={values} errors={{}} onChange={onChange} />
    );

    const textarea = screen.getByDisplayValue('Nota inicial');
    await user.type(textarea, ' extendida');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange with filtered list when removing note', async () => {
    const user = userEvent.setup();
    const values = {
      ...initialPlantFormState(),
      notes: ['Nota 1', 'Nota 2']
    };
    const onChange = vi.fn();

    render(
      <PlantNotesSection values={values} errors={{}} onChange={onChange} />
    );

    const removeButtons = screen.getAllByRole('button', {
      name: 'Eliminar nota'
    });
    await user.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledWith('notes', ['Nota 2']);
  });

  it('displays validation error alert when note has error', () => {
    const values = {
      ...initialPlantFormState(),
      notes: ['Nota demasiado larga']
    };
    const errors = { note_0: 'La nota no puede superar los 2000 caracteres.' };

    render(
      <PlantNotesSection values={values} errors={errors} onChange={vi.fn()} />
    );

    expect(
      screen.getByText('La nota no puede superar los 2000 caracteres.')
    ).toBeInTheDocument();
  });
});
