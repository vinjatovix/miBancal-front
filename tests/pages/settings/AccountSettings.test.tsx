import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';
import AccountSettings from '../../../src/pages/settings/AccountSettings';
import * as authServiceModule from '../../../src/services/auth.service';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function TestSettingsApp() {
  return (
    <Routes>
      <Route path="/login" element={<div>Página de login</div>} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

describe('AccountSettings Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    setStoredToken(VALID_TEST_TOKEN);
    vi.restoreAllMocks();
  });

  it('renders title, three password fields, visibility toggle buttons, and submit button', () => {
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: t('settings.title')
      })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('settings.old_password'))
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('settings.new_password'))
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('settings.repeat_new_password'))
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: t('auth.show_password') })
    ).toHaveLength(3);
    expect(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    ).toBeInTheDocument();
  });

  it('toggles visibility of password inputs when clicking toggle button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const oldPasswordInput = screen.getByLabelText(t('settings.old_password'));
    const [toggleBtn] = screen.getAllByRole('button', {
      name: t('auth.show_password')
    });

    expect(oldPasswordInput).toHaveAttribute('type', 'password');

    await user.click(toggleBtn);

    expect(oldPasswordInput).toHaveAttribute('type', 'text');
  });

  it('shows password strength bar when entering new password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const newPasswordInput = screen.getByLabelText(t('settings.new_password'));

    await user.type(newPasswordInput, 'Pass123!');

    expect(
      screen.getByText(t('auth.password_strength_strong'))
    ).toBeInTheDocument();
  });

  it('displays client validation errors and prevents submit on empty fields', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(authServiceModule, 'updatePassword');
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const submitBtn = screen.getByRole('button', {
      name: t('settings.change_password_submit')
    });

    await user.click(submitBtn);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(t('auth.required_field')).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('displays validation error when new passwords do not match', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.spyOn(authServiceModule, 'updatePassword');
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'DifferentPass123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(updateSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(t('auth.passwords_dont_match'))
    ).toBeInTheDocument();
  });

  it('submits valid form, displays fixed success alert, and clears input values', async () => {
    const user = userEvent.setup();
    const updateSpy = vi
      .spyOn(authServiceModule, 'updatePassword')
      .mockResolvedValueOnce({ message: 'Success' });
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const oldInput = screen.getByLabelText(t('settings.old_password'));
    const newInput = screen.getByLabelText(t('settings.new_password'));
    const repeatInput = screen.getByLabelText(
      t('settings.repeat_new_password')
    );

    await user.type(oldInput, 'CurrentPass123!');
    await user.type(newInput, 'NewPassword123!');
    await user.type(repeatInput, 'NewPassword123!');
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(updateSpy).toHaveBeenCalledWith({
      oldPassword: 'CurrentPass123!',
      password: 'NewPassword123!',
      repeatPassword: 'NewPassword123!'
    });
    expect(
      await screen.findByText(t('settings.success_message'))
    ).toBeInTheDocument();
    expect(oldInput).toHaveValue('');
    expect(newInput).toHaveValue('');
    expect(repeatInput).toHaveValue('');
  });

  it('clears fixed success alert when user interacts with any password field', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockResolvedValueOnce({
      message: 'Success'
    });
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const oldInput = screen.getByLabelText(t('settings.old_password'));
    const newInput = screen.getByLabelText(t('settings.new_password'));
    const repeatInput = screen.getByLabelText(
      t('settings.repeat_new_password')
    );
    await user.type(oldInput, 'CurrentPass123!');
    await user.type(newInput, 'NewPassword123!');
    await user.type(repeatInput, 'NewPassword123!');
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );
    await screen.findByText(t('settings.success_message'));

    await user.click(oldInput);

    expect(screen.queryByText(t('settings.success_message'))).toBeNull();
  });

  it('disables form controls and submit button during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: { message: string }) => void = () => {};
    const pendingPromise = new Promise<{ message: string }>((resolve) => {
      resolvePromise = resolve;
    });
    vi.spyOn(authServiceModule, 'updatePassword').mockReturnValueOnce(
      pendingPromise
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const submitBtn = screen.getByRole('button', {
      name: t('settings.change_password_submit')
    });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByLabelText(t('settings.old_password'))).toBeDisabled();
    expect(screen.getByLabelText(t('settings.new_password'))).toBeDisabled();
    expect(
      screen.getByLabelText(t('settings.repeat_new_password'))
    ).toBeDisabled();

    resolvePromise({ message: 'Success' });
    await screen.findByText(t('settings.success_message'));
  });

  it('handles server 400 error mapping errors.oldPassword to invalid current password message', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Bad request', 400, {
        oldPassword: 'Invalid password'
      })
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const oldInput = screen.getByLabelText(t('settings.old_password'));

    await user.type(oldInput, 'WrongPassword123!');
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(
      await screen.findByText(t('settings.invalid_current_password'))
    ).toBeInTheDocument();
    expect(oldInput).toHaveValue('WrongPassword123!');
  });

  it('handles server general error displaying error alert banner', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Internal server error', 500)
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Internal server error');
  });

  it('purges session and triggers redirect when updatePassword returns 401', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Unauthorized', 401)
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(await screen.findByText('Página de login')).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('renders read-only profile section with active user username and email', () => {
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: t('settings.profile_section')
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(t('settings.profile_username'))
    ).toBeInTheDocument();
    expect(screen.getByText('hortelano')).toBeInTheDocument();
    expect(screen.getByText(t('settings.profile_email'))).toBeInTheDocument();
    expect(screen.getByText('hortelano@example.com')).toBeInTheDocument();
  });

  it('renders accessible semantic sections for profile and security', () => {
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    expect(
      screen.getByRole('region', { name: t('settings.profile_section') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: t('settings.security_section') })
    ).toBeInTheDocument();
  });

  it('clears specific field error when user modifies that field', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });
    const oldInput = screen.getByLabelText(t('settings.old_password'));
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );
    await screen.findAllByText(t('auth.required_field'));

    await user.type(oldInput, 'ValidPass123!');

    expect(
      oldInput.closest('.auth-field')?.querySelector('.auth-error-text')
    ).toBeNull();
  });

  it('maps server field errors when 400 error does not contain oldPassword error', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Validation error', 400, {
        password: 'Password requirements failed'
      })
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(
      await screen.findByText('Password requirements failed')
    ).toBeInTheDocument();
  });

  it('displays fallback error message when 400 error has no field errors', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Bad request without details', 400)
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Bad request without details');
  });

  it('handles server 400 error preserving multiple field errors alongside oldPassword', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
      new ApiError('Validation error', 400, {
        oldPassword: 'Invalid current password',
        password: 'Password requirements failed'
      })
    );
    renderWithProviders(<TestSettingsApp />, { route: '/settings' });

    await user.type(
      screen.getByLabelText(t('settings.old_password')),
      'CurrentPass123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.new_password')),
      'NewPassword123!'
    );
    await user.type(
      screen.getByLabelText(t('settings.repeat_new_password')),
      'NewPassword123!'
    );
    await user.click(
      screen.getByRole('button', {
        name: t('settings.change_password_submit')
      })
    );

    expect(
      await screen.findByText(t('settings.invalid_current_password'))
    ).toBeInTheDocument();
    expect(
      screen.getByText('Password requirements failed')
    ).toBeInTheDocument();
  });

  it.each([
    'New password must be different from old password',
    'Password must be different from current password',
    'different'
  ])(
    'displays translated Spanish error alert when 400 error message is "%s"',
    async (errorMessage) => {
      const user = userEvent.setup();
      vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
        new ApiError(errorMessage, 400)
      );
      renderWithProviders(<TestSettingsApp />, { route: '/settings' });

      await user.type(
        screen.getByLabelText(t('settings.old_password')),
        'CurrentPass123!'
      );
      await user.type(
        screen.getByLabelText(t('settings.new_password')),
        'CurrentPass123!'
      );
      await user.type(
        screen.getByLabelText(t('settings.repeat_new_password')),
        'CurrentPass123!'
      );
      await user.click(
        screen.getByRole('button', {
          name: t('settings.change_password_submit')
        })
      );

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(t('settings.password_must_be_different'));
    }
  );

  it.each([
    'New password must be different from old password',
    'Password must be different from current password',
    'different'
  ])(
    'maps 400 password field error when backend message is "%s"',
    async (fieldErrorMessage) => {
      const user = userEvent.setup();
      vi.spyOn(authServiceModule, 'updatePassword').mockRejectedValueOnce(
        new ApiError('Validation error', 400, {
          password: fieldErrorMessage
        })
      );
      renderWithProviders(<TestSettingsApp />, { route: '/settings' });

      await user.type(
        screen.getByLabelText(t('settings.old_password')),
        'CurrentPass123!'
      );
      await user.type(
        screen.getByLabelText(t('settings.new_password')),
        'CurrentPass123!'
      );
      await user.type(
        screen.getByLabelText(t('settings.repeat_new_password')),
        'CurrentPass123!'
      );
      await user.click(
        screen.getByRole('button', {
          name: t('settings.change_password_submit')
        })
      );

      expect(
        await screen.findByText(t('settings.password_must_be_different'))
      ).toBeInTheDocument();
    }
  );
});
