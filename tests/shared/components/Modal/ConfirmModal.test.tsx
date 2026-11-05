import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmModal } from '../../../../src/shared/components/Modal/ConfirmModal';
import type { ModalVariant } from '../../../../src/shared/components/Modal/Modal';

describe('ConfirmModal', () => {
  it('renders modal dialog content when isOpen is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Confirm Operation"
        subtitle="Operation Subtitle"
        prompt="Are you sure you want to proceed?"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm Operation')).toBeInTheDocument();
    expect(screen.getByText('Operation Subtitle')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        title="Confirm Operation"
        confirmText="Proceed"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm Operation"
        cancelText="Abort"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abort' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when pressing Escape key', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm Operation"
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables cancel and confirm buttons when isLoading is true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Confirm Operation"
        isLoading={true}
        loadingText="Saving data..."
        cancelText="Cancel"
      />
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Saving data...' })
    ).toBeDisabled();
  });

  it('does not call onCancel on Escape key when isLoading is true', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="Confirm Operation"
        isLoading={true}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders warning callout when warningText is provided', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Dangerous Action"
        warningText="This action cannot be undone."
      />
    );

    expect(
      screen.getByText('This action cannot be undone.')
    ).toBeInTheDocument();
  });

  it('does not render static alert in modal body', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Error State"
      />
    );

    expect(container.querySelector('.confirm-modal-alert')).toBeNull();
  });

  it('renders custom children inside body', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Custom Content"
      >
        <div data-testid="custom-child">Additional Details</div>
      </ConfirmModal>
    );

    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it.each([
    ['default', 'modal-btn--default'],
    ['danger', 'modal-btn--danger'],
    ['warning', 'modal-btn--warning']
  ] as const)(
    'applies %s modifier class to confirm button',
    (variant: ModalVariant, expectedClass: string) => {
      render(
        <ConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          title="Variant Button"
          variant={variant}
          confirmText="Confirm Action"
        />
      );

      expect(
        screen.getByRole('button', { name: 'Confirm Action' })
      ).toHaveClass(expectedClass);
    }
  );
});
