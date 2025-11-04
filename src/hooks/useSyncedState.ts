import { useState } from 'react';

/**
 * This hook lets components create state that can be updated by the component or by its parent. It
 * is useful when components need state that doesn't just derive its initial value from a prop but
 * also synchronizes whenever the prop changes.
 *
 * Inspired by https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * # Example
 *
 * ```tsx
 * // `value` will be reset to `propValue` whenever `propValue` changes
 * const [value, setValue] = useSyncedState(propValue);
 *
 * // `value` can also be updated inside this component
 * return <input value={value} onChange={e => setValue(e.target.value)} />;
 * ```
 **/
export function useSyncedState<T>(value: T) {
  const [state, setState] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);
    setState(value);
  }

  return [state, setState] as const;
}
