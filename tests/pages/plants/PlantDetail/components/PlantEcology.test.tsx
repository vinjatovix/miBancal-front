import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlantEcology from '../../../../../src/pages/plants/PlantDetail/components/PlantEcology';
import { buildPlant } from '../../../../fixtures/plants/buildPlant';

describe('PlantEcology component', () => {
  it('renders heading and decorative eco icon for each benefit item', () => {
    const plant = buildPlant({
      knowledge: {
        ...buildPlant().knowledge,
        ecology: {
          strategicBenefits: ['Atrae polinizadores', 'Fija nitrógeno']
        }
      }
    });

    const { container } = render(<PlantEcology plant={plant} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Ecología'
    });
    const firstBenefit = screen.getByText('Atrae polinizadores');
    const secondBenefit = screen.getByText('Fija nitrógeno');
    const benefitIcons = container.querySelectorAll('li svg');

    expect(heading).toBeInTheDocument();
    expect(firstBenefit).toBeInTheDocument();
    expect(secondBenefit).toBeInTheDocument();
    expect(benefitIcons).toHaveLength(2);
  });

  it('renders nothing when strategic benefits list is empty', () => {
    const plant = buildPlant({
      knowledge: {
        ...buildPlant().knowledge,
        ecology: {
          strategicBenefits: []
        }
      }
    });

    const { container } = render(<PlantEcology plant={plant} />);

    expect(container).toBeEmptyDOMElement();
  });
});
