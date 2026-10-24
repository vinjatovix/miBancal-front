import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Plant } from '../../../../../../types/Plants/Plant';

type Tab = 'videos' | 'articles';

export function usePlantResources(plant: Plant) {
  const resources = useMemo(
    () => plant.knowledge.resources ?? [],
    [plant.knowledge.resources]
  );

  const videos = useMemo(
    () => resources.filter((r) => r.type === 'video'),
    [resources]
  );

  const articles = useMemo(
    () => resources.filter((r) => r.type === 'article'),
    [resources]
  );

  const initialTab: Tab = articles.length > 0 ? 'articles' : 'videos';

  const [tab, setTab] = useState<Tab>(initialTab);

  const videosRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (tab !== 'videos') return;
    if (!videosRef.current) return;

    setHeight(videosRef.current.scrollHeight);
  }, [tab, videos.length]);

  return {
    tab,
    setTab,
    videos,
    articles,
    videosRef,
    height
  };
}
