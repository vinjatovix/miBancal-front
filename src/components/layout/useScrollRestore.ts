import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { normalizeScrollY } from '../../shared/scroll/normalizeScrollY';
import { reportRejection } from '../../shared/observability/reportRejection';

export function useScrollRestore(): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const rawState =
      typeof location.state === 'object' && location.state !== null
        ? (location.state as Record<string, unknown>)
        : null;
    const targetY = normalizeScrollY(rawState?.restoreScrollY);

    if (targetY === undefined) {
      return;
    }

    const remainingState = { ...rawState };
    delete remainingState.restoreScrollY;

    Promise.resolve(
      navigate(`${location.pathname}${location.search}${location.hash}`, {
        replace: true,
        state:
          Object.keys(remainingState).length > 0 ? remainingState : undefined
      })
    ).catch(reportRejection('scroll-restore'));

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: targetY, behavior: 'instant' });

      const frameId = requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [location, navigate]);
}
