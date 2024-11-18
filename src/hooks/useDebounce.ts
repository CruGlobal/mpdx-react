import { useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';

// Callback isn't called until `delay` milliseconds have elapsed since the last call
export const useDebouncedCallback = <Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number,
): ((...args: Args) => Return | undefined) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(
    () => debounce((...args: Args) => callbackRef.current(...args), delay),
    [delay],
  );

  useEffect(() => {
    // Cancel any timeouts on unmount
    return () => {
      debouncedCallback.cancel();
    };
  }, []);

  return debouncedCallback;
};

// The return value doesn't change until `delay` milliseconds have elapsed since the last time `value` changed
export const useDebouncedValue = <Value>(
  value: Value,
  delay: number,
): Value => {
  const [debouncedValue, setDebouncedValue] = useState<Value>(value);
  const setValueDebounced = useDebouncedCallback(setDebouncedValue, delay);

  useEffect(() => {
    setValueDebounced(value);
  }, [value, delay]);

  return debouncedValue;
};
