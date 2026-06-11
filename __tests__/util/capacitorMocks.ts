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
 * Handlers detached via `handle.remove()` or `removeAllListeners()`. The
 * `emit*` helpers skip these, mirroring real plugin semantics so listener
 * ownership bugs (one module wiping another's listeners) are reproducible in
 * jest. Handler references are unique per `addListener` call in practice, so
 * entries from previous tests are inert; `jest.clearAllMocks()` resetting
 * `addListener.mock.calls` is what isolates tests from each other.
 */
const removedHandlers = new Set<ListenerHandler>();

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
      handler: ListenerHandler,
    ): Promise<PluginListenerHandle> => ({
      remove: jest.fn(async () => {
        removedHandlers.add(handler);
      }),
    }),
  ),
  removeAllListeners: jest.fn(async () => {
    for (const [, handler] of mockPushNotifications.addListener.mock.calls) {
      removedHandlers.add(handler);
    }
  }),
};

/**
 * Mock for the `SplashScreen` plugin. Use with
 * `jest.mock('@capacitor/splash-screen', () => ({ SplashScreen: mockSplashScreen }))`.
 */
export const mockSplashScreen = {
  show: jest.fn(async () => undefined),
  hide: jest.fn(async () => undefined),
};

/**
 * Mock for the `StatusBar` plugin. Use with
 * `jest.mock('@capacitor/status-bar', () => ({ StatusBar: mockStatusBar, Style: {...} }))`.
 * Re-declare the `Style` enum inline in the factory (`requireActual` would
 * load the real plugin, which imports `@capacitor/core` before these mocks
 * initialize).
 */
export const mockStatusBar = {
  setStyle: jest.fn(async () => undefined),
  setBackgroundColor: jest.fn(async () => undefined),
  setOverlaysWebView: jest.fn(async () => undefined),
};

/**
 * Mock for the `Haptics` plugin. Use with
 * `jest.mock('@capacitor/haptics', () => ({ Haptics: mockHaptics, NotificationType: {...} }))`.
 * Re-declare the `NotificationType` enum inline in the factory (see
 * `mockStatusBar` note above).
 */
export const mockHaptics = {
  impact: jest.fn(async () => undefined),
  notification: jest.fn(async () => undefined),
  vibrate: jest.fn(async () => undefined),
};

const emitToListeners = async (
  eventName: string,
  event: unknown,
): Promise<void> => {
  const handlers = mockPushNotifications.addListener.mock.calls
    .filter(([registeredEvent]) => registeredEvent === eventName)
    .map(([, handler]) => handler)
    .filter((handler) => !removedHandlers.has(handler))
    .map((handler) => handler as (event: unknown) => void | Promise<void>);
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

/** Fires attached 'pushNotificationActionPerformed' listeners, like a notification tap would. */
export const emitPushNotificationActionPerformed = (
  actionId: string,
  data: unknown,
): Promise<void> =>
  emitToListeners('pushNotificationActionPerformed', {
    actionId,
    notification: { data },
  });
