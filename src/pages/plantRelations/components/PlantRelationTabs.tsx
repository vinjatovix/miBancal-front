import { t } from '../../../i18n/core/t';
import type {
  RelationFilterCounts,
  RelationTabFilter
} from '../../../types/Plants/PlantRelation';
import './plantRelationTabs.css';

export interface PlantRelationTabsProps {
  readonly activeTab: RelationTabFilter;
  readonly counts: RelationFilterCounts;
  readonly onTabChange: (tab: RelationTabFilter) => void;
}

const TABS: readonly RelationTabFilter[] = ['all', 'beneficial', 'detrimental'];

export default function PlantRelationTabs({
  activeTab,
  counts,
  onTabChange
}: PlantRelationTabsProps) {
  const tabLabels: Record<RelationTabFilter, string> = {
    all: t('plantRelations.tabs.all', { count: counts.all }),
    beneficial: t('plantRelations.tabs.beneficial', {
      count: counts.beneficial
    }),
    detrimental: t('plantRelations.tabs.detrimental', {
      count: counts.detrimental
    })
  };

  return (
    <div
      role="tablist"
      aria-label={t('plantRelations.tabs.ariaLabel')}
      className="plant-relation-tabs"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab}`}
            className={`plant-relation-tabs__tab ${
              isActive ? 'plant-relation-tabs__tab--active' : ''
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tabLabels[tab]}
          </button>
        );
      })}
    </div>
  );
}
