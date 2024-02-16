// Adapted from https://usehooks-ts.com/react-hook/use-local-storage
import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const IS_SERVER = typeof window === 'undefined';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        return initialValue; // Return initialValue if parsing fails
      }

      return parsed as T;
    },
    [initialValue],
  );

  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (IS_SERVER) {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : initialValue;
    } catch (error) {
      return initialValue;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState(initialValue);

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
