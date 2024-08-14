import { RefObject, useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollProps {
  // The container to scroll
  containerRef: RefObject<HTMLElement>;

  // Should auto-scrolling be performed?
  enabled?: boolean;

  // Mouse X absolute position in pixels
  mouseX: number;

  // How many pixels from the edge should the container start scrolling?
  scrollThreshold: number;

  // How many pixels per second should the container scroll?
  scrollVelocity: number;
}

// This hook automatically scrolls an element horizontally when the mouse nears its edge. It is intended to be used by
// a drag-and-drop component to make sure that it is possible to drag-and-drop anywhere within a component that is
// wider than the screen.
export const useAutoScroll = ({
  containerRef,
  mouseX,
  enabled = true,
  scrollThreshold,
  scrollVelocity,
}: UseAutoScrollProps) => {
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);

  const handleScroll: FrameRequestCallback = useCallback(
    (time) => {
      // Time since handleScroll was last called in seconds
      const elapsedTime =
        lastFrameTime.current === null
          ? 0
          : (time - lastFrameTime.current) / 1000;
      lastFrameTime.current = time;

      if (!enabled || !containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const distanceFromLeftEdge = mouseX - containerRect.x;

      if (distanceFromLeftEdge <= scrollThreshold) {
        containerRef.current.scrollBy({ left: -elapsedTime * scrollVelocity });
      } else if (
        distanceFromLeftEdge >=
        containerRect.width - scrollThreshold
      ) {
        containerRef.current.scrollBy({ left: elapsedTime * scrollVelocity });
      }

      // Schedule the next scroll check
      rafId.current = requestAnimationFrame(handleScroll);
    },
    [enabled, mouseX],
  );

  // Reset the elapsed time counter when disabled. Otherwise, when it is enabled again, the first frame will calculate
  // the elapsed time as the time since the last time it was enabled.
  useEffect(() => {
    lastFrameTime.current = null;
  }, [enabled]);

  useEffect(() => {
    // Schedule the first scroll check
    rafId.current = requestAnimationFrame(handleScroll);
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleScroll]);
};
