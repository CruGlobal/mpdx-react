import { renderHook } from '@testing-library/react-hooks';
import { useSyncedState } from './useSyncedState';

describe('useSyncedState', () => {
  it('initializes state with the provided value', () => {
    const { result } = renderHook(() => useSyncedState('initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('allows state to be updated internally', () => {
    const { result } = renderHook(() => useSyncedState('initial'));

    result.current[1]('updated');

    expect(result.current[0]).toBe('updated');
  });

  it('resets state when prop value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useSyncedState(value),
      { initialProps: { value: 'initial' } },
    );

    result.current[1]('updated');
    expect(result.current[0]).toBe('updated');

    rerender({ value: 'reset' });
    expect(result.current[0]).toBe('reset');
  });
});
