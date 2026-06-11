import { ApolloClient } from '@apollo/client';
import { UserDevicePlatformEnum } from 'src/graphql/types.generated';
import {
  DestroyUserDeviceDocument,
  DestroyUserDeviceMutation,
  DestroyUserDeviceMutationVariables,
  RegisterUserDeviceDocument,
  RegisterUserDeviceMutation,
  RegisterUserDeviceMutationVariables,
} from './UserDevice.generated';
import { toDeviceLocale } from './deviceLocale';
import { getDevicePlatform, isNativeShell } from './nativeShell';
import {
  clearPushStorage,
  getStoredDeviceId,
  getStoredLocale,
  getStoredToken,
  setPushEnabled,
  storeRegistration,
} from './pushStorage';
import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Push device registration lifecycle (push-registration design §3.2).
 *
 * Every function here is a no-op in a browser: the first check is always
 * `isNativeShell()`, and `@capacitor/push-notifications` / `@capacitor/app`
 * are only ever loaded via dynamic `import()` after that check, so the web
 * bundle never downloads plugin code (master plan §3.4 R1).
 *
 * Listener ownership: the `PushNotifications` plugin is a module singleton
 * shared with `NativeDeepLinkProvider` (which owns the
 * `pushNotificationActionPerformed` tap listener — deep-links design §4.3).
 * This module therefore tracks the `PluginListenerHandle`s it attaches and
 * removes ONLY those — it must never call `removeAllListeners()`, which would
 * silently destroy the deep-link tap listener.
 */

export type PushPermissionResult = 'granted' | 'denied' | 'unavailable';

/** Called with the `registrationError` event or a failed registration mutation's error. */
export type PushRegistrationErrorHandler = (error: unknown) => void;

/** Called once a `registration` event has been fully processed (mutation done or skip confirmed). */
type PushRegisteredHandler = () => void;

/** Handles for the listeners THIS module attached — the only ones it may remove. */
let ownedListenerHandles: PluginListenerHandle[] = [];

/**
 * Set after the first successful registration mutation of this app launch.
 * The localStorage idempotent skip only applies once this is true: every new
 * session performs exactly one upserting `RegisterUserDevice` POST, so the
 * backend's `delete_conflicting_device` upsert can fix ownership after a user
 * switch and recreate rows the server deleted (e.g. SNS endpoint cleanup).
 */
let registeredThisSession = false;

/**
 * Bumped by `disablePush`. A registration mutation that resolves from a
 * previous epoch must not store state (the user has since disabled push) —
 * it fires a compensating `DestroyUserDevice` instead.
 */
let teardownEpoch = 0;

/** Test-only escape hatch for the module-level session state. */
export const resetPushRegistrationStateForTesting = (): void => {
  ownedListenerHandles = [];
  registeredThisSession = false;
  teardownEpoch = 0;
};

const loadPushPlugin = async () =>
  (
    await import(
      /* webpackChunkName: "CapacitorPushNotifications" */ '@capacitor/push-notifications'
    )
  ).PushNotifications;

/** Removes only the listeners this module attached — never other consumers'. */
const removeOwnedListeners = async (): Promise<void> => {
  const handles = ownedListenerHandles;
  ownedListenerHandles = [];
  await Promise.all(
    handles.map((handle) => handle.remove().catch(() => undefined)),
  );
};

// `version` is presence-validated server-side, so fall back when the shell
// cannot report one.
const fallbackShellVersion = '0.0.0';

const getShellVersion = async (): Promise<string> => {
  try {
    const { App } = await import(
      /* webpackChunkName: "CapacitorApp" */ '@capacitor/app'
    );
    const { version } = await App.getInfo();
    return version || fallbackShellVersion;
  } catch {
    // Plugin unavailable (e.g. shell without @capacitor/app) — still register
    return fallbackShellVersion;
  }
};

const toPlatformEnum = (
  platform: NonNullable<ReturnType<typeof getDevicePlatform>>,
): UserDevicePlatformEnum =>
  platform === 'APNS'
    ? UserDevicePlatformEnum.Apns
    : UserDevicePlatformEnum.Gcm;

/**
 * Registers the OS-issued token against `POST /api/v2/user/devices` (via the
 * `RegisterUserDevice` proxy mutation). The first registration of each app
 * launch always POSTs (an idempotent upsert server-side); afterwards the
 * stored token + locale comparison short-circuits repeat events within the
 * session. Resolves `true` when the registration is in effect, `false` when
 * it was aborted by a concurrent `disablePush`.
 */
const registerDeviceWithApi = async (
  client: ApolloClient<object>,
  token: string,
  locale: string,
): Promise<boolean> => {
  const platform = getDevicePlatform();
  if (!platform) {
    return false;
  }
  const mappedLocale = toDeviceLocale(locale);
  if (
    registeredThisSession &&
    getStoredToken() === token &&
    getStoredLocale() === mappedLocale &&
    getStoredDeviceId()
  ) {
    // Token and locale unchanged within this session — idempotent skip
    return true;
  }
  const epoch = teardownEpoch;
  const version = await getShellVersion();
  const { data } = await client.mutate<
    RegisterUserDeviceMutation,
    RegisterUserDeviceMutationVariables
  >({
    mutation: RegisterUserDeviceDocument,
    variables: {
      input: {
        platform: toPlatformEnum(platform),
        token,
        version,
        locale: mappedLocale,
      },
    },
  });
  const device = data?.registerUserDevice;
  if (!device) {
    return false;
  }
  if (epoch !== teardownEpoch) {
    // disablePush ran while the mutation was in flight: the user wants push
    // OFF, so don't resurrect local state — destroy the row we just created
    await client
      .mutate<DestroyUserDeviceMutation, DestroyUserDeviceMutationVariables>({
        mutation: DestroyUserDeviceDocument,
        variables: { input: { id: device.id } },
      })
      .catch(() => undefined);
    return false;
  }
  storeRegistration(device.id, token, mappedLocale);
  setPushEnabled(true);
  registeredThisSession = true;
  return true;
};

/**
 * Attaches the `registration`/`registrationError` listeners (idempotent
 * re-attach: any previously attached handles owned by this module are
 * removed first — never `removeAllListeners()`, see the module doc), then
 * calls `PushNotifications.register()` — which never prompts. The
 * `registration` listener is where the server call happens, so this single
 * path handles first registration, every app launch, AND token rotation (FCM
 * `onNewToken` / APNs token changes both surface as a new `registration`
 * event). If the mutation fails (e.g. offline), nothing is stored and the
 * next launch retries naturally.
 */
export const startPushRegistration = async (
  client: ApolloClient<object>,
  locale: string,
  onRegistrationError?: PushRegistrationErrorHandler,
  onRegistered?: PushRegisteredHandler,
): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
  const PushNotifications = await loadPushPlugin();
  await removeOwnedListeners();
  ownedListenerHandles.push(
    await PushNotifications.addListener('registration', ({ value: token }) =>
      registerDeviceWithApi(client, token, locale).then(
        (active) => {
          if (active) {
            onRegistered?.();
          }
        },
        (error) => onRegistrationError?.(error),
      ),
    ),
  );
  ownedListenerHandles.push(
    await PushNotifications.addListener('registrationError', (error) =>
      onRegistrationError?.(error),
    ),
  );
  await PushNotifications.register();
};

/** How long `enablePush` waits for the OS token + registration mutation. */
const registrationTimeoutMs = 30_000;

/**
 * User-facing opt-in — the ONLY place in the app allowed to call
 * `requestPermissions()` (prompts on iOS first call / Android 13+).
 * Launch-time re-registration must use `startPushRegistration` after a
 * non-prompting `checkPermissions()` instead.
 *
 * Resolves `'granted'` only once the device registration has actually
 * completed (OS `registration` event received AND the `RegisterUserDevice`
 * mutation finished), so callers can truthfully report success. Rejects when
 * registration fails or no token arrives within the timeout.
 */
export const enablePush = async (
  client: ApolloClient<object>,
  locale: string,
  onRegistrationError?: PushRegistrationErrorHandler,
): Promise<PushPermissionResult> => {
  if (!isNativeShell()) {
    return 'unavailable';
  }
  const PushNotifications = await loadPushPlugin();
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') {
    return 'denied';
  }
  return new Promise<PushPermissionResult>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settle(() =>
        reject(new Error('Push registration timed out waiting for the OS')),
      );
    }, registrationTimeoutMs);
    const settle = (finish: () => void) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        finish();
      }
    };
    startPushRegistration(
      client,
      locale,
      (error) => {
        onRegistrationError?.(error);
        settle(() =>
          reject(
            error instanceof Error
              ? error
              : new Error('Push registration failed'),
          ),
        );
      },
      () => settle(() => resolve('granted')),
    ).catch((error) => settle(() => reject(error)));
  });
};

/**
 * Best-effort teardown — used by the settings "disable" button AND logout.
 * Order matters: the teardown epoch is bumped first (so an in-flight
 * registration mutation cannot resurrect state afterwards — it compensates
 * with a `DestroyUserDevice` instead), then the `DestroyUserDevice` mutation
 * runs (it needs a valid apiToken, and on logout `clearStore()` would drop
 * it), then this module's own listeners are detached and the plugin
 * unregisters (the device stops receiving even if the DELETE failed), then
 * local storage is cleared. Every step is wrapped so one failure never blocks
 * the next or the caller.
 */
export const disablePush = async (
  client: ApolloClient<object>,
): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
  teardownEpoch += 1;
  registeredThisSession = false;
  const deviceId = getStoredDeviceId();
  if (deviceId) {
    await client
      .mutate<DestroyUserDeviceMutation, DestroyUserDeviceMutationVariables>({
        mutation: DestroyUserDeviceDocument,
        variables: { input: { id: deviceId } },
      })
      // Offline / 401 during logout / device already gone — proceed anyway;
      // the backend's stale-device cleanup handles the orphaned row
      .catch(() => undefined);
  }
  try {
    await removeOwnedListeners();
    const PushNotifications = await loadPushPlugin();
    await PushNotifications.unregister();
  } catch {
    // Plugin unavailable or teardown failed — still clear local state below
  }
  clearPushStorage();
};
