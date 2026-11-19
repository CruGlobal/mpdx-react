import { act, renderHook } from '@testing-library/react-hooks';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { useDrawerOpenState } from './useDrawerOpenState';

describe('useDrawerOpenState', () => {
  it('starts open on large screens', () => {
    matchMediaMock({ width: '1024px' });
    const { result } = renderHook(() => useDrawerOpenState());

    expect(result.current[0]).toBe(true);
  });

  it('starts closed on phones', () => {
    matchMediaMock({ width: '375px' });
    const { result } = renderHook(() => useDrawerOpenState());

    expect(result.current[0]).toBe(false);
  });

  it('can be reopened on phones', () => {
    matchMediaMock({ width: '375px' });
    const { result } = renderHook(() => useDrawerOpenState());

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
  });
});
