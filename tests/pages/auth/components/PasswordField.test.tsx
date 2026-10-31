import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PasswordField from '../../../../src/pages/auth/components/PasswordField';

describe('PasswordField - initial state and contract invariants', () => {
  it('renders input with type password initially (C6)', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    const input = screen.getByLabelText('Contraseña');

    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders toggle button with accessible name Mostrar contraseña when hidden (C1, C9)', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });

    expect(toggleButton).toBeInTheDocument();
  });

  it('sets aria-controls to matching input id on toggle button', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });

    expect(toggleButton).toHaveAttribute('aria-controls', 'test-pwd');
  });

  it.each([
    ['id', 'test-pwd'],
    ['name', 'password'],
    ['autocomplete', 'new-password']
  ])('preserves attribute %s as %s on the input (C10)', (attr, value) => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="new-password"
      />
    );

    const input = screen.getByLabelText('Contraseña');

    expect(input).toHaveAttribute(attr, value);
  });

  it('has type button to prevent form submission (C5)', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });

    expect(toggleButton).toHaveAttribute('type', 'button');
  });
});

describe('PasswordField - toggle visibility transitions', () => {
  it('switches input to type text on toggle click (C2)', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('updates accessible button name to Ocultar contraseña on click (C2)', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Ocultar contraseña'
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('re-masks password to type password on second click (C3)', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    await user.click(
      screen.getByRole('button', { name: 'Ocultar contraseña' })
    );

    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('restores accessible button name to Mostrar contraseña on second click (C3)', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );
    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    await user.click(
      screen.getByRole('button', { name: 'Ocultar contraseña' })
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('preserves the input value when toggling visibility (C4)', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="MiClaveSegura123!"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveValue('MiClaveSegura123!');
  });

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' ']
  ])('toggles visibility via keyboard %s key (C8)', async (_, key) => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );
    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });
    toggleButton.focus();

    await user.keyboard(key);

    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('PasswordField - props, children, and event handling', () => {
  it('calls onChange callback with updated text when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={handleChange}
        autoComplete="current-password"
      />
    );
    const input = screen.getByLabelText('Contraseña');

    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('calls onBlur callback when input loses focus', async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        onBlur={handleBlur}
        autoComplete="current-password"
      />
    );
    const input = screen.getByLabelText('Contraseña');
    await user.click(input);

    await user.tab();

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onBlur when clicking visibility toggle button', async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        onBlur={handleBlur}
        autoComplete="current-password"
      />
    );
    const input = screen.getByLabelText('Contraseña');
    await user.click(input);

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    expect(handleBlur).not.toHaveBeenCalled();
  });

  it('keeps input focused when clicking visibility toggle button', async () => {
    const user = userEvent.setup();
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value="secret123"
        onChange={vi.fn()}
        autoComplete="current-password"
      />
    );
    const input = screen.getByLabelText('Contraseña');
    await user.click(input);

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    expect(input).toHaveFocus();
  });

  it('renders optional labelRight element beside label', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
        labelRight={<a href="/forgot">¿Olvidaste?</a>}
      />
    );

    const link = screen.getByRole('link', { name: '¿Olvidaste?' });

    expect(link).toBeInTheDocument();
  });

  it('renders optional children content beneath the input', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
      >
        <div data-testid="custom-child">Contenido extra</div>
      </PasswordField>
    );

    const child = screen.getByTestId('custom-child');

    expect(child).toBeInTheDocument();
  });

  it('displays error text when error is provided', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
        error="Campo obligatorio"
      />
    );

    const errorSpan = screen.getByText('Campo obligatorio');

    expect(errorSpan).toBeInTheDocument();
  });

  it('applies error styling class when error is provided', () => {
    render(
      <PasswordField
        id="test-pwd"
        name="password"
        label="Contraseña"
        value=""
        onChange={vi.fn()}
        autoComplete="current-password"
        error="Campo obligatorio"
      />
    );

    const input = screen.getByLabelText('Contraseña');

    expect(input).toHaveClass('auth-input-error');
  });
});
