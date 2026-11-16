// Adapted from https://usehooks-ts.com/react-hook/use-local-storage
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const IS_SERVER = typeof window === 'undefined';

// React uses the server snapshot on the server and while hydrating, and the
// client snapshot for every other render
const subscribeNever = () => () => undefined;
const useIsHydrating = (): boolean =>
  useSyncExternalStore(
    subscribeNever,
    () => false,
    () => true,
  );

interface UseLocalStorageOptions {
  /**
   * Set when the value changes server-rendered markup. The server can't see
   * local storage, so while the page hydrates the first render uses the
   * default, like the server did, and the stored value is read after mount.
   * A client-only mount still reads the stored value in its first render.
   */
  readAfterHydration?: boolean;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T,
  { readAfterHydration = false }: UseLocalStorageOptions = {},
): [T, Dispatch<SetStateAction<T>>] => {
  const isHydrating = useIsHydrating();
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
    readAfterHydration && isHydrating ? defaultValue : readValue(),
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
