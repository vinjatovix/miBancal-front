import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UserSearchForm } from '../../../../src/pages/admin/components/UserSearchForm';

describe('UserSearchForm', () => {
  it('submits search query on form submission', () => {
    const onSearch = vi.fn();
    render(<UserSearchForm onSearch={onSearch} isLoading={false} />);
    const input = screen.getByRole('searchbox', { name: /buscar/i });
    const button = screen.getByRole('button', { name: /buscar/i });

    fireEvent.change(input, { target: { value: 'hortelano@example.com' } });
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('hortelano@example.com');
  });

  it('clears search input value when clear button is clicked', () => {
    render(<UserSearchForm onSearch={vi.fn()} isLoading={false} />);
    const input = screen.getByRole('searchbox', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'hortelano' } });
    const clearButton = screen.getByRole('button', {
      name: /limpiar búsqueda/i
    });

    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('disables submit button and shows loading state while loading', () => {
    render(<UserSearchForm onSearch={vi.fn()} isLoading={true} />);

    const button = screen.getByRole('button', { name: /buscando\.\.\./i });

    expect(button).toBeDisabled();
  });
});
