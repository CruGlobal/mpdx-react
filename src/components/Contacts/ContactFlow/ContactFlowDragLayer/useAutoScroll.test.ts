import { renderHook } from '@testing-library/react-hooks';
import { useAutoScroll } from './useAutoScroll';

// Mock requestAnimationFrame to allow fine-grained control of frames in tests.
// requestAnimationFrame overwrites window.requestAnimationFrame and returns a nextFrame method.
// Tests should call nextFrame with the number of milliseconds that have supposedly elapsed since
// the last frame to cause the last callback registered with requestAnimationFrame to be called.
const mockRequestAnimationFrame = () => {
  let lastCallback: FrameRequestCallback | null = null;

  let frameId = 0;
  window.requestAnimationFrame = jest.fn((callback) => {
    if (lastCallback) {
      throw new Error('Unused requestAnimationFrame available');
    }
    lastCallback = callback;
    return ++frameId;
  });
  window.cancelAnimationFrame = jest.fn((handle) => {
    if (handle !== frameId) {
      throw new Error('Attempted to cancel invalid frame');
    }
    lastCallback = null;
  });

  let time = 0;
  const nextFrame = (elapsedTime: number) => {
    const callback = lastCallback;
    if (!callback) {
      throw new Error('No requestAnimationFrame available');
    }
    lastCallback = null;
    time += elapsedTime;
    callback(time);
  };
  return nextFrame;
};

// Creates a container element with a specific position and width
const makeContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  container.scrollBy = jest.fn();
  container.getBoundingClientRect = jest
    .fn()
    .mockReturnValue({ x: 100, width: 1000 });
  return container;
};

describe('useAutoScroll', () => {
  it('scrolls right when the mouse is near the left edge', () => {
    const container = makeContainer();
    const nextFrame = mockRequestAnimationFrame();

    const { unmount } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: container },
        mouseX: 150,
        scrollThreshold: 100,
        scrollVelocity: 300,
      }),
    );

    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(1, { left: -0 });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(2, { left: -3 }); // 300 pixels/s for 10ms = 3px
    nextFrame(20);
    expect(container.scrollBy).toHaveBeenNthCalledWith(3, { left: -6 }); // 300 pixels/s for 20ms = 6px

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(4);
  });

  it('scrolls left when the mouse is near the right edge', () => {
    const container = makeContainer();
    const nextFrame = mockRequestAnimationFrame();

    const { unmount } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: container },
        mouseX: 1050,
        scrollThreshold: 100,
        scrollVelocity: 300,
      }),
    );

    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(1, { left: 0 });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(2, { left: 3 }); // 300 pixels/s for 10ms = 3px
    nextFrame(20);
    expect(container.scrollBy).toHaveBeenNthCalledWith(3, { left: 6 }); // 300 pixels/s for 20ms = 6px

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(4);
  });

  it('does not scroll when the mouse is not near an edge', () => {
    const container = makeContainer();
    const nextFrame = mockRequestAnimationFrame();

    const { unmount } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: container },
        mouseX: 550,
        scrollThreshold: 100,
        scrollVelocity: 300,
      }),
    );

    nextFrame(10);
    expect(container.scrollBy).toHaveBeenCalledTimes(0);

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(2);
  });

  it('does not scroll if enabled is false', () => {
    const container = makeContainer();
    const nextFrame = mockRequestAnimationFrame();

    const { unmount } = renderHook(() =>
      useAutoScroll({
        containerRef: { current: null },
        enabled: false,
        mouseX: 150,
        scrollThreshold: 100,
        scrollVelocity: 300,
      }),
    );

    nextFrame(10);
    expect(container.scrollBy).toHaveBeenCalledTimes(0);

    unmount();
    expect(cancelAnimationFrame).toHaveBeenLastCalledWith(1);
  });

  it('handles prop changes in the middle of scrolling', () => {
    const container = makeContainer();
    const nextFrame = mockRequestAnimationFrame();

    const { rerender } = renderHook(
      ({ mouseX, enabled }: { mouseX: number; enabled: boolean }) =>
        useAutoScroll({
          containerRef: { current: container },
          enabled,
          mouseX,
          scrollThreshold: 100,
          scrollVelocity: 300,
        }),
    );

    // Start scrolling right
    rerender({ mouseX: 150, enabled: true });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(1, { left: -0 });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(2, { left: -3 });

    // Stop scrolling because enabled is false
    (container.scrollBy as jest.Mock).mockReset();
    rerender({ mouseX: 550, enabled: false });
    nextFrame(10);
    expect(container.scrollBy).not.toHaveBeenCalled();

    // Switch to scrolling left
    (container.scrollBy as jest.Mock).mockReset();
    rerender({ mouseX: 1050, enabled: true });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(1, { left: 0 });
    nextFrame(10);
    expect(container.scrollBy).toHaveBeenNthCalledWith(2, { left: 3 });

    // Stop scrolling because the mouse moves outside of the threshold
    (container.scrollBy as jest.Mock).mockReset();
    rerender({ mouseX: 550, enabled: true });
    nextFrame(10);
    expect(container.scrollBy).not.toHaveBeenCalled();
  });
});
