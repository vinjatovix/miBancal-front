import { useCallback, useState } from 'react';

const STORAGE_KEY = 'agro_nav_rail_expanded';
const EXPANDED_BREAKPOINT_PX = 1200;

export interface NavRailState {
  readonly isExpanded: boolean;
  readonly toggleRail: () => void;
}

function resolveInitialExpanded(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      return true;
    }
    if (stored === 'false') {
      return false;
    }
  } catch {
    return resolveViewportExpanded();
  }

  return resolveViewportExpanded();
}

function resolveViewportExpanded(): boolean {
  if (typeof window !== 'undefined' && typeof window.innerWidth === 'number') {
    return window.innerWidth >= EXPANDED_BREAKPOINT_PX;
  }
  return true;
}

export function useNavRailState(): NavRailState {
  const [isExpanded, setIsExpanded] = useState<boolean>(resolveInitialExpanded);

  const toggleRail = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        return next;
      }
      return next;
    });
  }, []);

  return { isExpanded, toggleRail };
}
