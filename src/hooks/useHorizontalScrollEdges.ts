import { RefCallback, useEffect, useState } from 'react';

interface ScrollEdges {
  /** Content is hidden past the left edge */
  canScrollLeft: boolean;
  /** Content is hidden past the right edge */
  canScrollRight: boolean;
}

interface UseHorizontalScrollEdgesResult<T extends HTMLElement>
  extends ScrollEdges {
  scrollRef: RefCallback<T>;
}

/**
 * Tracks whether a horizontally scrolling element has content hidden past
 * either edge, so the page can show a cue that it scrolls. Attach the returned
 * ref to the scrolling element.
 */
export const useHorizontalScrollEdges = <
  T extends HTMLElement = HTMLDivElement,
>(): UseHorizontalScrollEdgesResult<T> => {
  const [element, setElement] = useState<T | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  useEffect(() => {
    if (!element) {
      return;
    }

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      // Allow a pixel of slack for fractional scroll positions
      const canScrollLeft = scrollLeft > 1;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
      setEdges((previous) =>
        previous.canScrollLeft === canScrollLeft &&
        previous.canScrollRight === canScrollRight
          ? previous
          : { canScrollLeft, canScrollRight },
      );
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    // Also watch the content, since its width changes with the language
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    if (element.firstElementChild) {
      observer?.observe(element.firstElementChild);
    }

    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [element]);

  return { scrollRef: setElement, ...edges };
};
