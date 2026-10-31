import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlantRelationTabs from '../../../../src/pages/plantRelations/components/PlantRelationTabs';
import type { RelationFilterCounts } from '../../../../src/types/Plants/PlantRelation';

const counts: RelationFilterCounts = {
  all: 10,
  beneficial: 7,
  detrimental: 3
};

describe('PlantRelationTabs', () => {
  it('renders tablist with accessible role and aria-label', () => {
    render(
      <PlantRelationTabs
        activeTab="all"
        counts={counts}
        onTabChange={vi.fn()}
      />
    );

    const tablist = screen.getByRole('tablist', {
      name: 'Filtrar relaciones por tipo'
    });
    expect(tablist).toBeInTheDocument();
  });

  it('renders dynamic counts on tabs and marks active tab selected', () => {
    render(
      <PlantRelationTabs
        activeTab="beneficial"
        counts={counts}
        onTabChange={vi.fn()}
      />
    );

    const allTab = screen.getByRole('tab', { name: 'Todas (10)' });
    const beneficialTab = screen.getByRole('tab', {
      name: 'Beneficiosas (7)'
    });
    const detrimentalTab = screen.getByRole('tab', {
      name: 'Perjudiciales (3)'
    });

    expect(allTab).toHaveAttribute('aria-selected', 'false');
    expect(beneficialTab).toHaveAttribute('aria-selected', 'true');
    expect(detrimentalTab).toHaveAttribute('aria-selected', 'false');
  });

  it('invokes onTabChange when inactive tab is clicked', async () => {
    const onTabChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PlantRelationTabs
        activeTab="all"
        counts={counts}
        onTabChange={onTabChange}
      />
    );

    const detrimentalTab = screen.getByRole('tab', {
      name: 'Perjudiciales (3)'
    });
    await user.click(detrimentalTab);

    expect(onTabChange).toHaveBeenCalledExactlyOnceWith('detrimental');
  });
});
