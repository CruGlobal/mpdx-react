// Adapted from https://usehooks-ts.com/react-hook/use-local-storage
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const IS_SERVER = typeof window === 'undefined';

interface UseLocalStorageOptions {
  /**
   * Read local storage during the first render (the default). Pass false when
   * the value changes server-rendered markup: the first render then matches the
   * server's default, and the stored value is read after mount.
   */
  initializeWithValue?: boolean;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  { initializeWithValue = true }: UseLocalStorageOptions = {},
): [T, Dispatch<SetStateAction<T>>] => {
  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        return defaultValue; // Return defaultValue if parsing fails
      }

      return parsed as T;
    },
    [defaultValue],
  );

  // Get from local storage then
  // parse stored json or return defaultValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (IS_SERVER) {
      return defaultValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }, [defaultValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState(() =>
    initializeWithValue ? readValue() : defaultValue,
  );

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    // Prevent build error "window is undefined" but keeps working
    if (IS_SERVER) {
      // eslint-disable-next-line no-console
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`,
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(readValue()) : value;

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(newValue));

      // Save state
      setStoredValue(newValue);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, []);

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  return [storedValue, setValue];
};
