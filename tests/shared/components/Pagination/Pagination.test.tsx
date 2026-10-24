import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Pagination from '../../../../src/shared/components/Pagination/Pagination';

function renderPagination(onPageChange = vi.fn()) {
  render(
    <Pagination
      pages={[1, 2, '...', 10]}
      currentPage={1}
      onPageChange={onPageChange}
    />
  );
  return onPageChange;
}

describe('Pagination', () => {
  it('names the navigation in Spanish', () => {
    renderPagination();

    expect(
      screen.getByRole('navigation', { name: 'Paginación' })
    ).toBeInTheDocument();
  });

  it('marks and disables the current page', () => {
    renderPagination();

    const current = screen.getByRole('button', { name: '1' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toBeDisabled();
  });

  it('changes to the pressed page', () => {
    const onPageChange = renderPagination();

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders ellipsis character with aria-hidden', () => {
    const { container } = render(
      <Pagination
        pages={[1, '...', 5]}
        currentPage={1}
        onPageChange={vi.fn()}
      />
    );

    const ellipsis = container.querySelector('.pagination__ellipsis');

    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
    expect(ellipsis).toHaveTextContent('…');
  });
});
