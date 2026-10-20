import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlantPhenologySection } from '../../../../../src/pages/plants/components/PlantForm/PlantPhenologySection';
import { initialPlantFormState } from '../../../../../src/pages/plants/components/PlantForm/utils/plantFormMappers';

describe('PlantPhenologySection', () => {
  it('renders section title and sowing range inputs', () => {
    const values = initialPlantFormState();

    render(
      <PlantPhenologySection values={values} errors={{}} onChange={vi.fn()} />
    );

    expect(
      screen.getByText('Fenología, siembra y recolección')
    ).toBeInTheDocument();
    expect(screen.getByText('Semillas por golpe')).toBeInTheDocument();
    expect(screen.getByText('Días de germinación')).toBeInTheDocument();
    expect(
      screen.getByText('Profundidad siembra directa (cm)')
    ).toBeInTheDocument();
  });

  it.each([
    ['seedsPerHole', 'Rango de semillas inválido'],
    ['germinationDays', 'Días de germinación inválidos'],
    ['directDepth', 'Profundidad directa inválida']
  ])('displays error alert for %s', (field, errorMessage) => {
    const values = initialPlantFormState();
    const errors = { [field]: errorMessage };

    render(
      <PlantPhenologySection
        values={values}
        errors={errors}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('calls onChange when typing in seeds per hole minimum bound', async () => {
    const user = userEvent.setup();
    const values = { ...initialPlantFormState(), seedsPerHoleMin: '' };
    const onChange = vi.fn();

    render(
      <PlantPhenologySection values={values} errors={{}} onChange={onChange} />
    );

    const [seedsMinInput] = screen.getAllByPlaceholderText('Mín.');
    await user.type(seedsMinInput, '3');

    expect(onChange).toHaveBeenCalledWith('seedsPerHoleMin', '3');
  });
});
