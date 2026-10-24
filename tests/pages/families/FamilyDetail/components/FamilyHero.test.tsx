import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FamilyHero } from '../../../../../src/pages/families/FamilyDetail/components/FamilyHero';
import { buildFamily } from '../../../../fixtures/families/buildFamily';

describe('FamilyHero', () => {
  const family = buildFamily();

  it('renders the scientific name with the scientific name style', () => {
    render(<FamilyHero family={family} />);

    expect(screen.getByText(family.scientificName)).toHaveClass(
      'scientific-name'
    );
  });

  it('does not render order nor species count as scientific names', () => {
    render(<FamilyHero family={family} />);

    expect(
      screen.getByText(family.extra!.order!, { exact: false })
    ).not.toHaveClass('scientific-name');
    expect(
      screen.getByText(String(family.extra!.speciesCount), { exact: false })
    ).not.toHaveClass('scientific-name');
  });
});
