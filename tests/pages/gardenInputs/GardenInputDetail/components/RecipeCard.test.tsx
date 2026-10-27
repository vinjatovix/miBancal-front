import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RecipeCard from '../../../../../src/pages/gardenInputs/GardenInputDetail/components/RecipeCard';
import { buildRecipe } from '../../../../fixtures/gardenInputs/gardenInputFixtures';

describe('RecipeCard', () => {
  it('renders details element with open attribute by default', () => {
    const recipe = buildRecipe();

    const { container } = render(<RecipeCard recipe={recipe} />);

    const details = container.querySelector('details');
    expect(details).toHaveAttribute('open');
  });

  it('renders recipe title inside summary heading', () => {
    const recipe = buildRecipe({ name: 'Purín clásico de 10 días' });

    render(<RecipeCard recipe={recipe} />);

    const summary = screen.getByText('Purín clásico de 10 días');
    expect(summary).toBeInTheDocument();
  });

  it('renders recipe description and brew time when provided', () => {
    const recipe = buildRecipe({
      description: 'Maceración aeróbica.',
      brewTime: '10 a 14 días'
    });

    render(<RecipeCard recipe={recipe} />);

    expect(screen.getByText('Maceración aeróbica.')).toBeInTheDocument();
    expect(screen.getByText(/10 a 14 días/)).toBeInTheDocument();
  });

  it('renders ingredients list with quantities', () => {
    const recipe = buildRecipe({
      ingredients: [
        { item: 'Ortiga fresca', quantity: '1 kg' },
        { item: 'Agua de lluvia', quantity: '10 L' }
      ]
    });

    render(<RecipeCard recipe={recipe} />);

    expect(screen.getByText('Ortiga fresca')).toBeInTheDocument();
    expect(screen.getByText('1 kg')).toBeInTheDocument();
    expect(screen.getByText('Agua de lluvia')).toBeInTheDocument();
    expect(screen.getByText('10 L')).toBeInTheDocument();
  });

  it('renders instructions in sequential order', () => {
    const recipe = buildRecipe({
      instructions: ['Picar hojas', 'Añadir agua', 'Remover diariamente']
    });

    render(<RecipeCard recipe={recipe} />);

    expect(screen.getByText('Picar hojas')).toBeInTheDocument();
    expect(screen.getByText('Añadir agua')).toBeInTheDocument();
    expect(screen.getByText('Remover diariamente')).toBeInTheDocument();
  });

  it('renders dosage details including translated application method', () => {
    const recipe = buildRecipe({
      dosage: {
        method: 'foliar',
        dilution: '1:20',
        frequency: 'Cada 15 días'
      }
    });

    render(<RecipeCard recipe={recipe} />);

    expect(screen.getByText('Foliar')).toBeInTheDocument();
    expect(screen.getByText(/1:20/)).toBeInTheDocument();
    expect(screen.getByText(/Cada 15 días/)).toBeInTheDocument();
  });

  it('renders storage details when available', () => {
    const recipe = buildRecipe({
      storage: {
        duration: 'Hasta 6 meses',
        conditions: 'Lugar oscuro y fresco',
        spoilageSigns: 'Olor pútrido'
      }
    });

    render(<RecipeCard recipe={recipe} />);

    expect(screen.getByText(/Hasta 6 meses/)).toBeInTheDocument();
    expect(screen.getByText(/Lugar oscuro y fresco/)).toBeInTheDocument();
    expect(screen.getByText(/Olor pútrido/)).toBeInTheDocument();
  });

  it('renders safety notes list when available', () => {
    const recipe = buildRecipe({
      safetyNotes: ['Usar guantes para no sufrir urticaria']
    });

    render(<RecipeCard recipe={recipe} />);

    expect(
      screen.getByText('Usar guantes para no sufrir urticaria')
    ).toBeInTheDocument();
  });
});
