import { act, renderHook } from '@testing-library/react';
import { useHorizontalScrollEdges } from './useHorizontalScrollEdges';

interface ScrollMetrics {
  scrollWidth: number;
  clientWidth: number;
  scrollLeft: number;
}

// jsdom doesn't lay anything out, so it reports 0 for every width and scroll
// position. Give the row the numbers a browser would measure instead, backed by
// an object the test can change later.
const createRow = (
  metrics: ScrollMetrics,
  { withContent = true } = {},
): HTMLDivElement => {
  const row = document.createElement('div');
  if (withContent) {
    row.appendChild(document.createElement('div'));
  }
  Object.defineProperties(row, {
    scrollWidth: { configurable: true, get: () => metrics.scrollWidth },
    clientWidth: { configurable: true, get: () => metrics.clientWidth },
    scrollLeft: {
      configurable: true,
      get: () => metrics.scrollLeft,
      set: (value: number) => {
        metrics.scrollLeft = value;
      },
    },
  });
  return row;
};

const renderAttached = (row: HTMLDivElement) => {
  const hook = renderHook(() => useHorizontalScrollEdges());
  act(() => {
    hook.result.current.scrollRef(row);
  });
  return hook;
};

const renderEdges = (
  initialMetrics: ScrollMetrics,
  options?: { withContent?: boolean },
) => {
  const metrics = { ...initialMetrics };
  const row = createRow(metrics, options);
  return { ...renderAttached(row), row, metrics };
};

const scrollTo = (row: HTMLDivElement, scrollLeft: number) => {
  act(() => {
    row.scrollLeft = scrollLeft;
    row.dispatchEvent(new Event('scroll'));
  });
};

const resizeWindow = () => {
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
};

describe('useHorizontalScrollEdges', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports no hidden content before a row is attached', () => {
    const { result } = renderHook(() => useHorizontalScrollEdges());

    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: false,
    });
  });

  it('reports neither edge when the content fits', () => {
    const { result } = renderEdges({
      scrollWidth: 400,
      clientWidth: 400,
      scrollLeft: 0,
    });

    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: false,
    });
  });

  it('reports only the right edge when content overflows and the row is at the start', () => {
    const { result } = renderEdges({
      scrollWidth: 800,
      clientWidth: 400,
      scrollLeft: 0,
    });

    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: true,
    });
  });

  it('reports both edges when the row is scrolled to the middle', () => {
    const { result } = renderEdges({
      scrollWidth: 800,
      clientWidth: 400,
      scrollLeft: 200,
    });

    expect(result.current).toMatchObject({
      canScrollLeft: true,
      canScrollRight: true,
    });
  });

  it('reports only the left edge when the row is scrolled to the end', () => {
    const { result } = renderEdges({
      scrollWidth: 800,
      clientWidth: 400,
      scrollLeft: 400,
    });

    expect(result.current).toMatchObject({
      canScrollLeft: true,
      canScrollRight: false,
    });
  });

  it.each([
    {
      name: 'one pixel of overflow counts as fitting',
      scrollWidth: 401,
      scrollLeft: 0,
      canScrollLeft: false,
      canScrollRight: false,
    },
    {
      name: 'two pixels of overflow count as overflowing',
      scrollWidth: 402,
      scrollLeft: 0,
      canScrollLeft: false,
      canScrollRight: true,
    },
    {
      name: 'one pixel from the start counts as the start',
      scrollWidth: 800,
      scrollLeft: 1,
      canScrollLeft: false,
      canScrollRight: true,
    },
    {
      name: 'two pixels from the start count as scrolled',
      scrollWidth: 800,
      scrollLeft: 2,
      canScrollLeft: true,
      canScrollRight: true,
    },
    {
      name: 'one pixel from the end counts as the end',
      scrollWidth: 800,
      scrollLeft: 399,
      canScrollLeft: true,
      canScrollRight: false,
    },
    {
      name: 'two pixels from the end count as short of the end',
      scrollWidth: 800,
      scrollLeft: 398,
      canScrollLeft: true,
      canScrollRight: true,
    },
  ])(
    'allows a pixel of slack: $name',
    ({ scrollWidth, scrollLeft, canScrollLeft, canScrollRight }) => {
      const { result } = renderEdges({
        scrollWidth,
        clientWidth: 400,
        scrollLeft,
      });

      expect(result.current).toMatchObject({ canScrollLeft, canScrollRight });
    },
  );

  it('updates as the row is scrolled', () => {
    const { result, row } = renderEdges({
      scrollWidth: 800,
      clientWidth: 400,
      scrollLeft: 0,
    });
    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: true,
    });

    scrollTo(row, 200);
    expect(result.current).toMatchObject({
      canScrollLeft: true,
      canScrollRight: true,
    });

    scrollTo(row, 400);
    expect(result.current).toMatchObject({
      canScrollLeft: true,
      canScrollRight: false,
    });

    scrollTo(row, 0);
    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: true,
    });
  });

  it('updates when the window resizes', () => {
    const { result, metrics } = renderEdges({
      scrollWidth: 600,
      clientWidth: 600,
      scrollLeft: 0,
    });
    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: false,
    });

    // The window narrows to phone width, so the row no longer fits
    metrics.clientWidth = 390;
    resizeWindow();
    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: true,
    });

    // And widens again
    metrics.clientWidth = 600;
    resizeWindow();
    expect(result.current).toMatchObject({
      canScrollLeft: false,
      canScrollRight: false,
    });
  });

  it('stops listening for scroll and resize after unmount', () => {
    const row = createRow({
      scrollWidth: 800,
      clientWidth: 400,
      scrollLeft: 0,
    });
    const addRowListener = jest.spyOn(row, 'addEventListener');
    const removeRowListener = jest.spyOn(row, 'removeEventListener');
    const addWindowListener = jest.spyOn(window, 'addEventListener');
    const removeWindowListener = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderAttached(row);

    const scrollHandler = addRowListener.mock.calls.find(
      ([type]) => type === 'scroll',
    )?.[1];
    const resizeHandler = addWindowListener.mock.calls.find(
      ([type]) => type === 'resize',
    )?.[1];
    expect(scrollHandler).toBeDefined();
    expect(resizeHandler).toBeDefined();

    unmount();

    expect(removeRowListener).toHaveBeenCalledWith('scroll', scrollHandler);
    expect(removeWindowListener).toHaveBeenCalledWith('resize', resizeHandler);
  });

  describe('with ResizeObserver', () => {
    const originalResizeObserver = window.ResizeObserver;
    const observe = jest.fn();
    const disconnect = jest.fn();
    let resizeCallback: ResizeObserverCallback;

    const reportResize = () => {
      act(() => {
        resizeCallback([], {} as ResizeObserver);
      });
    };

    beforeEach(() => {
      window.ResizeObserver = jest.fn().mockImplementation((callback) => {
        resizeCallback = callback;
        return { observe, unobserve: jest.fn(), disconnect };
      });
    });

    afterEach(() => {
      window.ResizeObserver = originalResizeObserver;
    });

    it('observes the row and its content', () => {
      const { row } = renderEdges({
        scrollWidth: 400,
        clientWidth: 400,
        scrollLeft: 0,
      });

      expect(observe).toHaveBeenCalledWith(row);
      expect(observe).toHaveBeenCalledWith(row.firstElementChild);
    });

    it('observes only the row when it has no content', () => {
      const { row } = renderEdges(
        { scrollWidth: 400, clientWidth: 400, scrollLeft: 0 },
        { withContent: false },
      );

      expect(observe).toHaveBeenCalledTimes(1);
      expect(observe).toHaveBeenCalledWith(row);
    });

    it('updates when the content grows without a scroll or window resize', () => {
      const { result, metrics } = renderEdges({
        scrollWidth: 400,
        clientWidth: 400,
        scrollLeft: 0,
      });
      expect(result.current).toMatchObject({
        canScrollLeft: false,
        canScrollRight: false,
      });

      // For example, the tab labels get longer after switching languages
      metrics.scrollWidth = 700;
      reportResize();
      expect(result.current).toMatchObject({
        canScrollLeft: false,
        canScrollRight: true,
      });
    });

    it('disconnects the observer on unmount', () => {
      const { unmount } = renderEdges({
        scrollWidth: 400,
        clientWidth: 400,
        scrollLeft: 0,
      });
      expect(disconnect).not.toHaveBeenCalled();

      unmount();
      expect(disconnect).toHaveBeenCalled();
    });
  });

  describe('without ResizeObserver', () => {
    const originalResizeObserver = window.ResizeObserver;

    beforeEach(() => {
      Reflect.deleteProperty(window, 'ResizeObserver');
    });

    afterEach(() => {
      window.ResizeObserver = originalResizeObserver;
    });

    it('still tracks the edges from the initial size, scrolling, and resizing', () => {
      expect(typeof ResizeObserver).toBe('undefined');
      const { result, row, metrics } = renderEdges({
        scrollWidth: 800,
        clientWidth: 400,
        scrollLeft: 0,
      });
      expect(result.current).toMatchObject({
        canScrollLeft: false,
        canScrollRight: true,
      });

      scrollTo(row, 400);
      expect(result.current).toMatchObject({
        canScrollLeft: true,
        canScrollRight: false,
      });

      // The window widens until the whole row fits, which resets the scroll
      metrics.clientWidth = 800;
      metrics.scrollLeft = 0;
      resizeWindow();
      expect(result.current).toMatchObject({
        canScrollLeft: false,
        canScrollRight: false,
      });
    });
  });
});
