import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlantFamilySelect } from '../../../../../src/pages/plants/components/PlantForm/PlantFamilySelect';
import { ADMIN_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';
import { listFamilyItemsResponse } from '../../../../fixtures/families/listFamilyItems';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { stubFetchOk } from '../../../../test-utils/stubFetch';

describe('PlantFamilySelect', () => {
  it('renders select with placeholder option and external link to create new family', () => {
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantFamilySelect value="" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/families/new');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('attaches session token in hash to preserve authentication when user is authenticated', () => {
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantFamilySelect value="" onChange={vi.fn()} />, {
      initialToken: ADMIN_TEST_TOKEN
    });

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      `/families/new#session_token=${encodeURIComponent(ADMIN_TEST_TOKEN)}`
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('populates family options from API and calls onChange upon selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantFamilySelect value="" onChange={onChange} />);

    const select = screen.getByRole('combobox');
    const option = await screen.findByRole('option', {
      name: /amarilidáceas/i
    });
    expect(option).toBeInTheDocument();

    await user.selectOptions(select, option);

    expect(onChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', () => {
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(
      <PlantFamilySelect
        value=""
        onChange={vi.fn()}
        error="Familia obligatoria"
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute(
      'aria-describedby',
      'plant-family-select-error'
    );
    expect(screen.getByText('Familia obligatoria')).toBeInTheDocument();
  });

  it('refreshes family options when clicking refresh button', async () => {
    const user = userEvent.setup();
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantFamilySelect value="" onChange={vi.fn()} />);
    await screen.findByRole('option', { name: /amarilidáceas/i });

    const newFamily = {
      id: 'f-new-99',
      name: 'Zingiberáceas',
      scientificName: 'Zingiberaceae'
    };
    stubFetchOk({
      ...listFamilyItemsResponse,
      data: [...listFamilyItemsResponse.data, newFamily]
    });
    const refreshBtn = screen.getByRole('button', {
      name: 'Actualizar listado de familias'
    });
    await user.click(refreshBtn);

    expect(
      await screen.findByRole('option', { name: /zingiberáceas/i })
    ).toBeInTheDocument();
  });

  it('refreshes family options on window focus', async () => {
    stubFetchOk(listFamilyItemsResponse);

    renderWithProviders(<PlantFamilySelect value="" onChange={vi.fn()} />);
    await screen.findByRole('option', { name: /amarilidáceas/i });

    const newFamily = {
      id: 'f-focus-1',
      name: 'Orquidáceas',
      scientificName: 'Orchidaceae'
    };
    stubFetchOk({
      ...listFamilyItemsResponse,
      data: [...listFamilyItemsResponse.data, newFamily]
    });
    window.dispatchEvent(new Event('focus'));

    expect(
      await screen.findByRole('option', { name: /orquidáceas/i })
    ).toBeInTheDocument();
  });
});
