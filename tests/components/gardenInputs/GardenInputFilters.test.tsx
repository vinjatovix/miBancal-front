import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import GardenInputFilters from '../../../src/components/gardenInputs/GardenInputFilters/GardenInputFilters';

describe('GardenInputFilters', () => {
  it('renders category chips with accessible pressed state', () => {
    render(
      <GardenInputFilters
        selectedCategories={['defense']}
        selectedActions={[]}
        hasActiveFilters={true}
        onToggleCategory={vi.fn()}
        onToggleAction={vi.fn()}
        onClear={vi.fn()}
      />
    );

    const categoryGroup = screen.getByRole('group', { name: 'Categoría' });
    const defenseChip = within(categoryGroup).getByRole('button', {
      name: 'Defensa'
    });
    const fertilizerChip = within(categoryGroup).getByRole('button', {
      name: 'Fertilizante'
    });

    expect(defenseChip).toHaveAttribute('aria-pressed', 'true');
    expect(fertilizerChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onToggleCategory when clicking category chip', () => {
    const onToggleCategory = vi.fn();
    render(
      <GardenInputFilters
        selectedCategories={[]}
        selectedActions={[]}
        hasActiveFilters={false}
        onToggleCategory={onToggleCategory}
        onToggleAction={vi.fn()}
        onClear={vi.fn()}
      />
    );

    const categoryGroup = screen.getByRole('group', { name: 'Categoría' });
    const biostimulantChip = within(categoryGroup).getByRole('button', {
      name: 'Bioestimulante'
    });
    fireEvent.click(biostimulantChip);

    expect(onToggleCategory).toHaveBeenCalledWith('biostimulant');
  });

  it('renders action chips with accessible pressed state', () => {
    render(
      <GardenInputFilters
        selectedCategories={[]}
        selectedActions={['fungicide']}
        hasActiveFilters={true}
        onToggleCategory={vi.fn()}
        onToggleAction={vi.fn()}
        onClear={vi.fn()}
      />
    );

    const actionGroup = screen.getByRole('group', {
      name: 'Acción agronómica'
    });
    const fungicideChip = within(actionGroup).getByRole('button', {
      name: 'Fungicida'
    });
    const insecticideChip = within(actionGroup).getByRole('button', {
      name: 'Insecticida'
    });

    expect(fungicideChip).toHaveAttribute('aria-pressed', 'true');
    expect(insecticideChip).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onToggleAction when clicking action chip', () => {
    const onToggleAction = vi.fn();
    render(
      <GardenInputFilters
        selectedCategories={[]}
        selectedActions={[]}
        hasActiveFilters={false}
        onToggleCategory={vi.fn()}
        onToggleAction={onToggleAction}
        onClear={vi.fn()}
      />
    );

    const actionGroup = screen.getByRole('group', {
      name: 'Acción agronómica'
    });
    const repellentChip = within(actionGroup).getByRole('button', {
      name: 'Repelente'
    });
    fireEvent.click(repellentChip);

    expect(onToggleAction).toHaveBeenCalledWith('repellent');
  });

  it('calls onClear when clicking clear filters button', () => {
    const onClear = vi.fn();
    render(
      <GardenInputFilters
        selectedCategories={['defense']}
        selectedActions={[]}
        hasActiveFilters={true}
        onToggleCategory={vi.fn()}
        onToggleAction={vi.fn()}
        onClear={onClear}
      />
    );

    const clearButton = screen.getByRole('button', {
      name: /Limpiar filtros/i
    });
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders status filter select when isEditor is true', () => {
    render(
      <GardenInputFilters
        selectedCategories={[]}
        selectedActions={[]}
        hasActiveFilters={false}
        isEditor={true}
        onToggleCategory={vi.fn()}
        onToggleAction={vi.fn()}
        onStatusChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not render status filter select when isEditor is false or omitted', () => {
    render(
      <GardenInputFilters
        selectedCategories={[]}
        selectedActions={[]}
        hasActiveFilters={false}
        onToggleCategory={vi.fn()}
        onToggleAction={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
