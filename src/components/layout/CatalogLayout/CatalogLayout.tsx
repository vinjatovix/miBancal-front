import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { t } from '../../../i18n/core/t';
import Drawer from '../../../shared/components/Drawer/Drawer';
import useDrawer from '../../../shared/hooks/useDrawer';
import useMediaQuery from '../../../shared/hooks/useMediaQuery';

import './catalogLayout.css';

export interface CatalogLayoutProps {
  readonly filters: ReactNode;
  readonly children: ReactNode;
  readonly activeCount?: number;
  readonly filterLabel?: string;
  readonly className?: string;
}

export default function CatalogLayout({
  filters,
  children,
  activeCount,
  filterLabel = t('common.filters'),
  className
}: CatalogLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isOpen, open, close } = useDrawer(false);

  useEffect(() => {
    if (!isMobile && isOpen) {
      close();
    }
  }, [isMobile, isOpen, close]);

  const rootClassName = className
    ? `catalog-layout ${className}`
    : 'catalog-layout';

  const hasBadge = activeCount !== undefined && activeCount > 0;

  return (
    <div className={rootClassName}>
      {!isMobile && (
        <aside className="catalog-layout__sidebar" aria-label={filterLabel}>
          {filters}
        </aside>
      )}

      {isMobile && !isOpen && (
        <button type="button" onClick={open} className="catalog-layout__fab">
          <span className="catalog-layout__fab-label">{filterLabel}</span>
          {hasBadge && (
            <span
              className="catalog-layout__fab-badge"
              data-testid="catalog-fab-badge"
            >
              {activeCount}
            </span>
          )}
        </button>
      )}

      {isMobile && (
        <Drawer isOpen={isOpen} onClose={close}>
          {filters}
        </Drawer>
      )}

      <div className="catalog-layout__main">{children}</div>
    </div>
  );
}
