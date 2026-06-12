import React from 'react';
import { act, render } from '@testing-library/react';
import { useContainerWidth } from './useContainerWidth';

const TestComponent: React.FC = () => {
  const { containerRef, width } = useContainerWidth();
  return <div ref={containerRef}>{width ?? 'unmeasured'}</div>;
};

describe('useContainerWidth', () => {
  const originalResizeObserver = window.ResizeObserver;
  const observe = jest.fn();
  const disconnect = jest.fn();
  let resizeCallback: ResizeObserverCallback;

  const resize = (width: number) => {
    act(() => {
      resizeCallback(
        [{ contentRect: { width } }] as unknown as ResizeObserverEntry[],
        {} as ResizeObserver,
      );
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
    jest.clearAllMocks();
  });

  it('returns null before the first measurement', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('unmeasured')).toBeInTheDocument();
  });

  it('observes the container element', () => {
    const { getByText } = render(<TestComponent />);

    expect(observe).toHaveBeenCalledWith(getByText('unmeasured'));
  });

  it('returns the width and updates it as the container resizes', () => {
    const { getByText } = render(<TestComponent />);

    resize(500);
    expect(getByText('500')).toBeInTheDocument();

    resize(800);
    expect(getByText('800')).toBeInTheDocument();
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<TestComponent />);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
