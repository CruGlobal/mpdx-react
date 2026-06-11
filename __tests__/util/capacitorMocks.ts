import type { PermissionState, PluginListenerHandle } from '@capacitor/core';

/**
 * Shared Capacitor mocks for nativeShell tests (push-registration design
 * §6.1). Real Capacitor packages are installed, so plain `jest.mock`
 * factories work — including through dynamic `import()`.
 *
 * Usage in a test file (export names are `mock`-prefixed so jest's hoisting
 * check allows them inside the factory):
 *
 * ```ts
 * import {
 *   mockCapacitorCore,
 *   mockPushNotifications,
 *   setNativePlatform,
 *   emitRegistration,
 * } from '__tests__/util/capacitorMocks';
 *
 * jest.mock('@capacitor/core', () => mockCapacitorCore);
 * jest.mock('@capacitor/push-notifications', () => ({
 *   PushNotifications: mockPushNotifications,
 * }));
 * ```
 */

export type CapacitorMockPlatform = 'ios' | 'android' | 'web';

let currentPlatform: CapacitorMockPlatform = 'web';

/**
 * Drives `mockCapacitorCore`. Defaults to 'web'; set it explicitly in each
 * test (or a beforeEach) — the value persists between tests in a file.
 */
export const setNativePlatform = (platform: CapacitorMockPlatform): void => {
  currentPlatform = platform;
};

/** Module factory for `jest.mock('@capacitor/core', () => mockCapacitorCore)`. */
export const mockCapacitorCore = {
  Capacitor: {
    isNativePlatform: jest.fn(() => currentPlatform !== 'web'),
    getPlatform: jest.fn(() => currentPlatform),
  },
};

type ListenerHandler = (event: never) => void | Promise<void>;

/**
 * Mock for the `PushNotifications` plugin. Use with
 * `jest.mock('@capacitor/push-notifications', () => ({ PushNotifications: mockPushNotifications }))`.
 * Override per test, e.g.
 * `mockPushNotifications.checkPermissions.mockResolvedValue({ receive: 'denied' })`.
 */
export const mockPushNotifications = {
  checkPermissions: jest.fn(async () => ({
    receive: 'prompt' as PermissionState,
  })),
  requestPermissions: jest.fn(async () => ({
    receive: 'granted' as PermissionState,
  })),
  register: jest.fn(async () => undefined),
  unregister: jest.fn(async () => undefined),
  addListener: jest.fn(
    async (
      _eventName: string,
      _handler: ListenerHandler,
    ): Promise<PluginListenerHandle> => ({
      remove: jest.fn(async () => undefined),
    }),
  ),
  removeAllListeners: jest.fn(async () => undefined),
};

const emitToListeners = async (
  eventName: string,
  event: unknown,
): Promise<void> => {
  const handlers = mockPushNotifications.addListener.mock.calls
    .filter(([registeredEvent]) => registeredEvent === eventName)
    .map(([, handler]) => handler as (event: unknown) => void | Promise<void>);
  for (const handler of handlers) {
    await handler(event);
  }
};

/** Fires attached 'registration' listeners with a token, like the OS would. */
export const emitRegistration = (token: string): Promise<void> =>
  emitToListeners('registration', { value: token });

/** Fires attached 'registrationError' listeners. */
export const emitRegistrationError = (error: string): Promise<void> =>
  emitToListeners('registrationError', { error });
