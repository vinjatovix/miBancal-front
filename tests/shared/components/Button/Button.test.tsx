import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../../../src/shared/components/Button/Button';

describe('Button', () => {
  it('renders children as button text with default neutral variant and md size', () => {
    render(<Button>Guardar cambios</Button>);

    const button = screen.getByRole('button', { name: 'Guardar cambios' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('app-button--neutral');
    expect(button).toHaveClass('app-button--md');
  });

  it.each([
    ['primary', 'app-button--primary'],
    ['success', 'app-button--success'],
    ['danger', 'app-button--danger'],
    ['neutral', 'app-button--neutral']
  ] as const)('applies %s variant class', (variant, expectedClass) => {
    render(<Button variant={variant}>Acción</Button>);

    const button = screen.getByRole('button', { name: 'Acción' });

    expect(button).toHaveClass(expectedClass);
  });

  it.each([
    ['sm', 'app-button--sm'],
    ['md', 'app-button--md'],
    ['lg', 'app-button--lg']
  ] as const)('applies %s size class', (size, expectedClass) => {
    render(<Button size={size}>Acción</Button>);

    const button = screen.getByRole('button', { name: 'Acción' });

    expect(button).toHaveClass(expectedClass);
  });

  it('renders decorative icon when icon name is provided', () => {
    render(<Button icon="plant_relations">Añadir relación</Button>);

    const button = screen.getByRole('button', { name: 'Añadir relación' });
    const icon = button.querySelector('svg');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Enviar</Button>);

    const button = screen.getByRole('button', { name: 'Enviar' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Deshabilitado
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Deshabilitado' });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('renders as a router link when to prop is provided', () => {
    render(
      <MemoryRouter>
        <Button to="/plants/new" variant="primary">
          Nueva planta
        </Button>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Nueva planta' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/plants/new');
    expect(link).toHaveClass('app-button--primary');
  });
});
