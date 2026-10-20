import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Modal, {
  type ModalVariant
} from '../../../../src/shared/components/Modal/Modal';

describe('Modal', () => {
  it('does not render dialog when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Modal content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sets aria-modal to true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders default role dialog', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders custom role alertdialog', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} role="alertdialog">
        Modal content
      </Modal>
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('renders title and associates it with aria-labelledby', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
        Modal content
      </Modal>
    );

    const heading = screen.getByRole('heading', { name: 'Test Title' });
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('uses explicit ariaLabelledBy when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Custom ID Title"
        ariaLabelledBy="custom-modal-title"
      >
        Modal content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'custom-modal-title'
    );
  });

  it('sets aria-describedby when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        ariaDescribedBy="custom-modal-description"
      >
        <p id="custom-modal-description">Detailed description</p>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute(
      'aria-describedby',
      'custom-modal-description'
    );
  });

  it('renders subtitle when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} subtitle="Security Warning">
        Modal content
      </Modal>
    );

    expect(screen.getByText('Security Warning')).toBeInTheDocument();
  });

  it('renders icon badge when icon is provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} icon="warning">
        Modal content
      </Modal>
    );

    expect(
      screen.getByRole('dialog').querySelector('.modal-icon-badge')
    ).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Closeable Modal">
        Modal content
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar ventana' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('renders custom closeLabel on close button', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Custom Close Label"
        closeLabel="Descartar y volver"
      >
        Modal content
      </Modal>
    );

    expect(
      screen.getByRole('button', { name: 'Descartar y volver' })
    ).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="No Close Button"
        showCloseButton={false}
      >
        Modal content
      </Modal>
    );

    expect(
      screen.queryByRole('button', { name: 'Cerrar ventana' })
    ).not.toBeInTheDocument();
  });

  it('calls onClose when pressing Escape key', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        Modal content
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose on Escape key when preventClose is true', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} preventClose={true}>
        Modal content
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables close button when preventClose is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Prevent Close"
        preventClose={true}
      >
        Modal content
      </Modal>
    );

    expect(
      screen.getByRole('button', { name: 'Cerrar ventana' })
    ).toBeDisabled();
  });

  it('calls onClose when clicking overlay backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        Modal content
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside dialog card', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div data-testid="modal-inner">Modal content</div>
      </Modal>
    );

    fireEvent.click(screen.getByTestId('modal-inner'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose on overlay click when preventClose is true', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} preventClose={true}>
        Modal content
      </Modal>
    );

    const overlay = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('locks body scroll to hidden when open and restores on unmount', () => {
    document.body.style.overflow = 'visible';

    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        Modal content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('visible');
  });

  it('renders footer when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        footer={<button type="button">Footer Action</button>}
      >
        Modal content
      </Modal>
    );

    expect(
      screen.getByRole('button', { name: 'Footer Action' })
    ).toBeInTheDocument();
  });

  it('applies custom maxWidth style to modal card', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} maxWidth="640px">
        Modal content
      </Modal>
    );

    expect(screen.getByRole('dialog')).toHaveStyle({ maxWidth: '640px' });
  });

  it.each([
    ['default', 'modal-card--default'],
    ['danger', 'modal-card--danger'],
    ['warning', 'modal-card--warning'],
    ['info', 'modal-card--info']
  ] as const)(
    'applies %s variant modifier class',
    (variant: ModalVariant, expectedClass: string) => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} variant={variant}>
          Variant content
        </Modal>
      );

      expect(screen.getByRole('dialog')).toHaveClass(expectedClass);
    }
  );
});
