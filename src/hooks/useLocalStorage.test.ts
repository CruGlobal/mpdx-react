import { act, renderHook } from '@testing-library/react-hooks';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const initialValue = { key: 'initial' };
  const storageKey = 'storage-key';
  const getItem = jest.fn();
  const setItem = jest.fn();

  beforeEach(() => {
    window.Storage.prototype.getItem = getItem;
    window.Storage.prototype.setItem = setItem;
  });

  it('returns the initial value', () => {
    const { result } = renderHook(() =>
      useLocalStorage(storageKey, initialValue),
    );

    expect(result.current[0]).toBe(initialValue);
  });

  it('reads the value from local storage', () => {
    getItem.mockReturnValue('{"key":"value"}');

    const { result } = renderHook(() =>
      useLocalStorage(storageKey, initialValue),
    );

    expect(getItem).toHaveBeenCalledWith(storageKey);
    expect(result.current[0]).toEqual({ key: 'value' });
  });

  it('writes the value to local storage', () => {
    const { result } = renderHook(() =>
      useLocalStorage(storageKey, initialValue),
    );

    act(() => {
      result.current[1]({ key: 'value' });
    });

    expect(setItem).toHaveBeenCalledWith(storageKey, '{"key":"value"}');
    expect(result.current[0]).toEqual({ key: 'value' });
  });
});
