import React from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../../i18n/core/t';
import { toUiError } from '../../errors/toUiError';
import type { UiError } from './types';

import './errorResponse.css';

type ErrorResponseProps = {
  error: unknown;
  onRetry?: () => void;
  onClearFilters?: () => void;
};

type ErrorAction =
  | { type: 'goHome' }
  | { type: 'button'; label: string; onClick: () => void }
  | { type: 'none' };

const KINDS_WITHOUT_RETRY: ReadonlySet<UiError['kind']> = new Set([
  'forbidden',
  'notFound',
  'badRequest'
]);

function selectAction(
  kind: UiError['kind'],
  { onRetry, onClearFilters }: Omit<ErrorResponseProps, 'error'>
): ErrorAction {
  if (kind === 'badRequest' && onClearFilters) {
    return {
      type: 'button',
      label: t('errors.actions.clearFilters'),
      onClick: onClearFilters
    };
  }
  if (KINDS_WITHOUT_RETRY.has(kind)) return { type: 'goHome' };
  if (onRetry) {
    return {
      type: 'button',
      label: t('errors.actions.retry'),
      onClick: onRetry
    };
  }
  return { type: 'none' };
}

const ErrorActionView: React.FC<{ action: ErrorAction }> = ({ action }) => {
  if (action.type === 'goHome') {
    return (
      <Link to="/" className="error-response__action">
        {t('errors.actions.goHome')}
      </Link>
    );
  }
  if (action.type === 'button') {
    return (
      <button
        type="button"
        className="error-response__action"
        onClick={action.onClick}
      >
        {action.label}
      </button>
    );
  }
  return null;
};

export const ErrorResponse: React.FC<ErrorResponseProps> = ({
  error,
  onRetry,
  onClearFilters
}) => {
  const uiError = toUiError(error, { listFilters: Boolean(onClearFilters) });
  const action = selectAction(uiError.kind, { onRetry, onClearFilters });

  return (
    <div className="error-response">
      <p role="alert" className="error-response__message">
        {uiError.message}
      </p>
      <ErrorActionView action={action} />
    </div>
  );
};
