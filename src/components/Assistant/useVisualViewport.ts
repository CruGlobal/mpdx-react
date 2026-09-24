import { useEffect, useState } from 'react';

interface VisualViewportSize {
  height: number;
  offsetTop: number;
}

// dvh ignores the on-screen keyboard, so phones size the drawer to the visible viewport instead
export const useVisualViewport = (
  enabled: boolean,
): VisualViewportSize | null => {
  const [size, setSize] = useState<VisualViewportSize | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) {
      setSize(null);
      return;
    }

    const update = () =>
      setSize({ height: viewport.height, offsetTop: viewport.offsetTop });
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return size;
};
