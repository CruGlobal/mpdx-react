import { act } from '@testing-library/react';

// Call at the top level of a test file. Returns a function that changes
// navigator.onLine and notifies useIsOnline. Online is restored after each test.
export const mockNavigatorOnline = () => {
  let online = true;
  let spy: jest.SpyInstance | undefined;

  afterEach(() => {
    online = true;
    spy?.mockRestore();
    spy = undefined;
  });

  return (value: boolean) => {
    online = value;
    spy ??= jest
      .spyOn(window.navigator, 'onLine', 'get')
      .mockImplementation(() => online);
    act(() => {
      window.dispatchEvent(new Event(value ? 'online' : 'offline'));
    });
  };
};
