import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AnomalyHero } from '../../../../../src/pages/anomalies/AnomalyDetail/components/AnomalyHero';
import {
  AuthContext,
  type AuthContextValue
} from '../../../../../src/shared/auth/authContextDef';
import { buildAnomaly } from '../../../../fixtures/anomalies/buildAnomaly';

const editorAuth: AuthContextValue = {
  session: null,
  user: {
    id: 'u1',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['admin']
  },
  isAuthenticated: true,
  isAdmin: true,
  isEditor: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  activate: vi.fn(),
  googleLogin: vi.fn(),
  githubLogin: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  logout: vi.fn()
};

describe('AnomalyHero', () => {
  it('renders title, badges and scientific name without image elements when anomaly has no images', () => {
    const anomaly = buildAnomaly({
      resources: []
    });

    render(<AnomalyHero anomaly={anomaly} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
    expect(screen.getByText('Plaga')).toBeInTheDocument();
    expect(screen.getByText('Myzus persicae')).toBeInTheDocument();
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('renders a static figure with image and caption without carousel controls when anomaly has exactly one image', () => {
    const anomaly = buildAnomaly({
      resources: [
        {
          type: 'image',
          url: 'https://images.example.com/pulgon.jpg',
          title: 'Detalle de colonia',
          source: 'INIA'
        }
      ]
    });

    render(<AnomalyHero anomaly={anomaly} />);

    const img = screen.getByAltText('Detalle de colonia');
    expect(img).toHaveAttribute('src', 'https://images.example.com/pulgon.jpg');
    expect(screen.getByText('Detalle de colonia')).toBeInTheDocument();
    expect(screen.getByText('Fuente: INIA')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Imagen anterior' })
    ).not.toBeInTheDocument();
  });

  it('delegates to carousel with navigation controls when anomaly has two or more images', () => {
    const anomaly = buildAnomaly({
      resources: [
        {
          type: 'image',
          url: 'https://images.example.com/pulgon-1.jpg',
          title: 'Imagen 1'
        },
        {
          type: 'image',
          url: 'https://images.example.com/pulgon-2.jpg',
          title: 'Imagen 2'
        }
      ]
    });

    render(<AnomalyHero anomaly={anomaly} />);

    const carousel = screen.getByRole('region', {
      name: 'Galería de imágenes de la anomalía'
    });
    expect(carousel).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Imagen anterior' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Imagen siguiente' })
    ).toBeInTheDocument();
  });

  it('triggers onEdit callback when clicking edit button in editor mode', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    const anomaly = buildAnomaly();

    render(
      <AuthContext.Provider value={editorAuth}>
        <AnomalyHero anomaly={anomaly} onEdit={onEdit} />
      </AuthContext.Provider>
    );

    const editBtn = screen.getByRole('button', { name: 'Editar' });
    await user.click(editBtn);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
