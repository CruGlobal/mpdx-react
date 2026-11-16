import { createElement } from 'react';
import { render } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { renderToString } from 'react-dom/server';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const initialValue = { key: 'initial' };
  const storageKey = 'storage-key';
  const getItem = jest.fn();
  const setItem = jest.fn();

  beforeEach(() => {
    getItem.mockReset();
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
    expect(result.all[0]).toEqual([{ key: 'value' }, expect.any(Function)]);
    expect(result.current[0]).toEqual({ key: 'value' });
  });

  it('reads local storage in the first client-only render when readAfterHydration is set', () => {
    getItem.mockReturnValue('{"key":"value"}');

    const { result } = renderHook(() =>
      useLocalStorage(storageKey, initialValue, { readAfterHydration: true }),
    );

    expect(result.all[0]).toEqual([{ key: 'value' }, expect.any(Function)]);
  });

  it('matches the server markup while hydrating when readAfterHydration is set', () => {
    const Probe = () => {
      const [value] = useLocalStorage(storageKey, initialValue, {
        readAfterHydration: true,
      });
      return createElement('span', { 'data-value': value.key });
    };
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    // The server can't see local storage, so it renders the default.
    // The markup is React's own output, not user input.
    const container = document.createElement('div');
    container.insertAdjacentHTML(
      'afterbegin',
      renderToString(createElement(Probe)),
    );
    document.body.appendChild(container);
    getItem.mockReturnValue('{"key":"value"}');

    render(createElement(Probe), { container, hydrate: true });

    // The stored value replaces the default after hydration, with no mismatch
    expect(container.querySelector('span')).toHaveAttribute(
      'data-value',
      'value',
    );
    expect(consoleError.mock.calls.flat().join(' ')).not.toContain(
      'did not match',
    );
    consoleError.mockRestore();
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
