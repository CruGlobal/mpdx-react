import { useEffect, useSyncExternalStore } from 'react';

// A page with its own bottom right controls, like the contacts map, asks the orb to sit further left
let clearance: number | null = null;
const listeners = new Set<() => void>();

const setClearance = (value: number | null) => {
  clearance = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getGuideOrbClearance = (): number | null => clearance;

export const useGuideOrbClearance = (right: number): void => {
  useEffect(() => {
    setClearance(right);
    return () => setClearance(null);
  }, [right]);
};

export const useGuideOrbRight = (fallback: number): number =>
  useSyncExternalStore(subscribe, getGuideOrbClearance, () => null) ?? fallback;
