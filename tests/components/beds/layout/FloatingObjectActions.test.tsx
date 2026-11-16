import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FloatingObjectActions from '../../../../src/components/beds/layout/FloatingObjectActions';

describe('FloatingObjectActions', () => {
  it('renders nothing when anchor is null', () => {
    const { container } = render(
      <FloatingObjectActions anchor={null} kind="crops" />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when kind is null', () => {
    const { container } = render(
      <FloatingObjectActions anchor={{ x: 100, y: 100 }} kind={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders crop action buttons when kind is crops and anchor is provided', () => {
    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="crops"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onClearSelection={vi.fn()}
      />
    );

    const toolbar = screen.getByRole('toolbar', {
      name: 'Acciones de selección'
    });
    expect(toolbar).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Duplicar seleccionadas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Eliminar seleccionadas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Limpiar selección/i })
    ).toBeInTheDocument();
  });

  it('invokes onDuplicate callback when clicking duplicate button', async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="crops"
        onDuplicate={onDuplicate}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /Duplicar seleccionadas/i })
    );

    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete callback when clicking delete button', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="crops"
        onDelete={onDelete}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /Eliminar seleccionadas/i })
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('applies modifier class when placement is below', () => {
    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="bed"
        placement="below"
      />
    );

    const toolbar = screen.getByRole('toolbar', {
      name: 'Acciones de selección'
    });
    expect(toolbar).toHaveClass('floating-object-actions--below');
  });

  it('does not apply modifier class when placement is above or omitted', () => {
    render(<FloatingObjectActions anchor={{ x: 150, y: 200 }} kind="bed" />);

    const toolbar = screen.getByRole('toolbar', {
      name: 'Acciones de selección'
    });
    expect(toolbar).not.toHaveClass('floating-object-actions--below');
  });

  it('invokes onClearSelection callback when clicking clear selection button', async () => {
    const user = userEvent.setup();
    const onClearSelection = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="crops"
        onClearSelection={onClearSelection}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /Limpiar selección/i })
    );

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it('positions toolbar using anchor coordinates', () => {
    render(
      <FloatingObjectActions
        anchor={{ x: 250, y: 400 }}
        kind="crops"
        onDuplicate={vi.fn()}
      />
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveStyle({ left: '250px', top: '400px' });
  });

  it('disables action buttons when disabled prop is true', () => {
    render(
      <FloatingObjectActions
        anchor={{ x: 150, y: 200 }}
        kind="crops"
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onClearSelection={vi.fn()}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });

  it('renders bed action buttons when kind is bed and anchor is provided', () => {
    render(
      <FloatingObjectActions
        anchor={{ x: 100, y: 150 }}
        kind="bed"
        onRotate={vi.fn()}
        onUnplace={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: /Rotar bancal/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Devolver a sin colocar/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Editar bancal/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Eliminar bancal/i })
    ).toBeInTheDocument();
  });

  it('invokes onRotate callback when clicking rotate button', async () => {
    const user = userEvent.setup();
    const onRotate = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 100, y: 150 }}
        kind="bed"
        onRotate={onRotate}
      />
    );

    await user.click(screen.getByRole('button', { name: /Rotar bancal/i }));

    expect(onRotate).toHaveBeenCalledTimes(1);
  });

  it('invokes onUnplace callback when clicking unplace button', async () => {
    const user = userEvent.setup();
    const onUnplace = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 100, y: 150 }}
        kind="bed"
        onUnplace={onUnplace}
      />
    );

    await user.click(
      screen.getByRole('button', { name: /Devolver a sin colocar/i })
    );

    expect(onUnplace).toHaveBeenCalledTimes(1);
  });

  it('invokes onEdit callback when clicking edit button', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 100, y: 150 }}
        kind="bed"
        onEdit={onEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: /Editar bancal/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete callback when clicking bed delete button', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <FloatingObjectActions
        anchor={{ x: 100, y: 150 }}
        kind="bed"
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: /Eliminar bancal/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
