import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlantInlineEditForm } from '../../../src/pages/plants/PlantDetail/components/PlantInlineEditForm';
import { buildPlant } from '../../fixtures/plants/buildPlant';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('plantFormAccessibility', () => {
  it('provides accessible labels for all primary form inputs', () => {
    const plant = buildPlant();

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(
      screen.getByLabelText(/nombre común principal/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre científico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url de la fotografía/i)).toBeInTheDocument();
  });

  it.each([
    { label: /altura \(cm\): mín\./i },
    { label: /altura \(cm\): máx\./i },
    { label: /envergadura \(cm\): mín\./i },
    { label: /envergadura \(cm\): máx\./i },
    { label: /marco de plantación \(cm\): mín\./i },
    { label: /marco de plantación \(cm\): máx\./i }
  ])('provides accessible label for trait input $label', ({ label }) => {
    const plant = buildPlant();

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it('marks invalid fields with aria-invalid="true" and emits role="alert"', async () => {
    const user = userEvent.setup();
    const plant = buildPlant({
      identity: {
        name: { primary: '', aliases: [] },
        scientificName: '',
        family: { id: '', name: '', slug: '' }
      },
      image: { url: '' }
    });

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Guardar cambios' });
    await user.click(submitBtn);

    const primaryNameInput = screen.getByLabelText(/nombre común principal/i);
    expect(primaryNameInput).toHaveAttribute('aria-invalid', 'true');

    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('supports keyboard focus progression across form inputs', async () => {
    const user = userEvent.setup();
    const plant = buildPlant();

    renderWithProviders(
      <PlantInlineEditForm
        plant={plant}
        etag='"1"'
        onCancel={vi.fn()}
        onSuccess={vi.fn()}
        onReload={vi.fn()}
      />
    );

    const primaryNameInput = screen.getByLabelText(/nombre común principal/i);
    await user.click(primaryNameInput);
    expect(primaryNameInput).toHaveFocus();

    await user.tab();
    const scientificNameInput = screen.getByLabelText(/nombre científico/i);
    expect(scientificNameInput).toHaveFocus();
  });
});
