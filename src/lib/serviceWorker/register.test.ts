import type { registerServiceWorker as RegisterServiceWorker } from './register';
import type { Serwist } from '@serwist/window';

jest.mock('@serwist/window', () => ({
  Serwist: jest.fn(),
}));

const originalNodeEnv = process.env.NODE_ENV;

const setNodeEnv = (value: string) => {
  (process.env as Record<string, string>).NODE_ENV = value;
};

const setServiceWorkerSupport = (supported: boolean) => {
  if (supported) {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      configurable: true,
    });
  } else {
    delete (navigator as { serviceWorker?: unknown }).serviceWorker;
  }
};

// The module memoizes its instance, so each test loads a fresh copy
const loadModule = (register: jest.Mock) => {
  let registerServiceWorker!: typeof RegisterServiceWorker;
  let SerwistMock!: jest.Mock;
  jest.isolateModules(() => {
    SerwistMock = jest.requireMock('@serwist/window').Serwist;
    SerwistMock.mockImplementation(() => ({ register }));
    registerServiceWorker =
      jest.requireActual('./register').registerServiceWorker;
  });
  return { registerServiceWorker, SerwistMock };
};

describe('registerServiceWorker', () => {
  beforeEach(() => {
    setNodeEnv('production');
    setServiceWorkerSupport(true);
  });

  afterEach(() => {
    setNodeEnv(originalNodeEnv as string);
    setServiceWorkerSupport(false);
  });

  it('registers /sw.js once and returns the instance in production', () => {
    const register = jest.fn().mockResolvedValue(undefined);
    const { registerServiceWorker, SerwistMock } = loadModule(register);

    const serwist = registerServiceWorker();

    expect(SerwistMock).toHaveBeenCalledTimes(1);
    expect(SerwistMock).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
      type: 'classic',
    });
    expect(register).toHaveBeenCalledTimes(1);
    expect(serwist).toBe(SerwistMock.mock.results[0].value);
  });

  it('returns the same instance on a second call', () => {
    const register = jest.fn().mockResolvedValue(undefined);
    const { registerServiceWorker, SerwistMock } = loadModule(register);

    const first = registerServiceWorker();
    const second = registerServiceWorker();

    expect(second).toBe(first);
    expect(SerwistMock).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledTimes(1);
  });

  it('does nothing outside production', () => {
    setNodeEnv('development');
    const register = jest.fn();
    const { registerServiceWorker, SerwistMock } = loadModule(register);

    expect(registerServiceWorker()).toBeUndefined();
    expect(SerwistMock).not.toHaveBeenCalled();
  });

  it('does nothing when the browser has no service worker support', () => {
    setServiceWorkerSupport(false);
    const register = jest.fn();
    const { registerServiceWorker, SerwistMock } = loadModule(register);

    expect(registerServiceWorker()).toBeUndefined();
    expect(SerwistMock).not.toHaveBeenCalled();
  });

  it('swallows a rejected registration', async () => {
    const onUnhandled = jest.fn();
    process.on('unhandledRejection', onUnhandled);
    const register = jest.fn().mockRejectedValue(new Error('404'));
    const { registerServiceWorker } = loadModule(register);

    let serwist: Serwist | undefined;
    expect(() => {
      serwist = registerServiceWorker();
    }).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 0));
    process.off('unhandledRejection', onUnhandled);

    expect(serwist).toBeDefined();
    expect(onUnhandled).not.toHaveBeenCalled();
  });
});
