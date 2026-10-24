import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Icon from '../../src/shared/components/Icon/Icon';
import Pagination from '../../src/shared/components/Pagination/Pagination';
import SliderFilter from '../../src/components/plants/SliderFilter';
import Badge from '../../src/shared/components/Badge/Badge';
import type { IconName } from '../../src/shared/components/Icon/iconPaths';

describe('icon accessibility contract - decorative icons', () => {
  it.each([
    'eco',
    'biotech',
    'lock',
    'admin_panel_settings',
    'restaurant',
    'dangerous',
    'close',
    'search',
    'thumb_up',
    'thumb_up_filled'
  ] as IconName[])(
    'renders decorative %s icon with aria-hidden="true"',
    (name) => {
      const { container } = render(<Icon name={name} decorative />);

      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).not.toHaveAttribute('role');
      expect(svg).not.toHaveAttribute('aria-label');
    }
  );
});

describe('icon accessibility contract - semantic icons', () => {
  it.each([
    ['lock', 'Acceso'],
    ['login', 'Iniciar sesión'],
    ['person_add', 'Crear cuenta'],
    ['admin_panel_settings', 'Administración']
  ] as [IconName, string][])(
    'renders semantic %s icon with role="img" and accessible name %s',
    (name, label) => {
      render(<Icon name={name} label={label} />);

      const img = screen.getByRole('img', { name: label });

      expect(img).toBeInTheDocument();
      expect(img).not.toHaveAttribute('aria-hidden');
    }
  );
});

describe('icon accessibility contract - shared UI components', () => {
  it('hides Badge decorative icon from screen readers', () => {
    const { container } = render(<Badge icon="label">Solanáceas</Badge>);

    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides Pagination ellipsis with aria-hidden="true"', () => {
    const { container } = render(
      <Pagination
        pages={[1, '...', 5]}
        currentPage={1}
        onPageChange={() => {}}
      />
    );

    const ellipsis = container.querySelector('.pagination__ellipsis');

    expect(ellipsis).toHaveAttribute('aria-hidden', 'true');
  });

  it('provides accessible name for SliderFilter reset button', () => {
    render(
      <SliderFilter
        label="Altura"
        value={150}
        min={0}
        max={300}
        step={10}
        onChange={() => {}}
        onCommit={() => {}}
      />
    );

    const resetButton = screen.getByRole('button', {
      name: 'Quitar filtro de Altura'
    });

    expect(resetButton).toBeInTheDocument();
  });
});
