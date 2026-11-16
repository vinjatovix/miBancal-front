import { useCallback } from 'react';
import {
  useNavigate,
  type NavigateFunction,
  type NavigateOptions,
  type To
} from 'react-router-dom';

import { reportRejection } from './reportRejection';

export function useReportedNavigate(section: string): NavigateFunction {
  const navigate = useNavigate();

  return useCallback<NavigateFunction>(
    (to: To | number, options?: NavigateOptions): void => {
      const navigation =
        typeof to === 'number' ? navigate(to) : navigate(to, options);
      Promise.resolve(navigation).catch(reportRejection(section));
    },
    [navigate, section]
  );
}
