import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';

import {
  reportUnexpectedError,
  toUnexpectedErrorReport
} from '../shared/observability/reportUnexpectedError';
import { AppErrorScreen } from './AppErrorScreen';

export function LayoutErrorFallback() {
  const error = useRouteError();

  useEffect(() => {
    reportUnexpectedError(
      toUnexpectedErrorReport(error, { kind: 'render', section: 'app' }),
      error
    );
  }, [error]);

  return <AppErrorScreen />;
}
