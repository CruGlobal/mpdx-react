import { RefObject, useEffect, useRef, useState } from 'react';

interface UseContainerWidthResult<T extends HTMLElement> {
  containerRef: RefObject<T>;
  /** The container's width, or null before the first measurement */
  width: number | null;
}

/**
 * Measures the width of a container element and updates as it resizes. Attach
 * the returned ref to the element to measure.
 */
export const useContainerWidth = <
  T extends HTMLElement = HTMLDivElement,
>(): UseContainerWidthResult<T> => {
  const containerRef = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
};
