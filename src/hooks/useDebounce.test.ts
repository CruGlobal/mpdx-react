import { renderHook } from '@testing-library/react-hooks';
import { useDebouncedCallback } from './useDebounce';

type Callback = () => void;

describe('useDebouncedCallback', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('calls the function after a delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 1000));

    result.current(1);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    result.current(2);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1500);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(2);
  });

  it('handles changes to the function without resetting the elapsed delay', () => {
    const firstCallback = jest.fn();
    const { result, rerender } = renderHook<{ callback: Callback }, Callback>(
      ({ callback }) => useDebouncedCallback(callback, 1000),
      {
        initialProps: { callback: firstCallback },
      },
    );

    result.current();
    jest.advanceTimersByTime(500);

    const secondCallback = jest.fn();
    rerender({ callback: secondCallback });

    jest.advanceTimersByTime(750);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });
});
