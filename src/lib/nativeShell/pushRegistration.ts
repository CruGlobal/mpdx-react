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

/**
 * Push device registration lifecycle (push-registration design §3.2).
 *
 * Every function here is a no-op in a browser: the first check is always
 * `isNativeShell()`, and `@capacitor/push-notifications` / `@capacitor/app`
 * are only ever loaded via dynamic `import()` after that check, so the web
 * bundle never downloads plugin code (master plan §3.4 R1).
 */

export type PushPermissionResult = 'granted' | 'denied' | 'unavailable';

/** Called with the `registrationError` event or a failed registration mutation's error. */
export type PushRegistrationErrorHandler = (error: unknown) => void;

const loadPushPlugin = async () =>
  (
    await import(
      /* webpackChunkName: "CapacitorPushNotifications" */ '@capacitor/push-notifications'
    )
  ).PushNotifications;

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
 * `RegisterUserDevice` proxy mutation) unless the same token + locale is
 * already registered — the steady-state relaunch makes zero network calls.
 */
const registerDeviceWithApi = async (
  client: ApolloClient<object>,
  token: string,
  locale: string,
): Promise<void> => {
  const platform = getDevicePlatform();
  if (!platform) {
    return;
  }
  const mappedLocale = toDeviceLocale(locale);
  if (
    getStoredToken() === token &&
    getStoredLocale() === mappedLocale &&
    getStoredDeviceId()
  ) {
    // Token and locale unchanged — idempotent skip, no network call
    return;
  }
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
    return;
  }
  storeRegistration(device.id, token, mappedLocale);
  setPushEnabled(true);
};

/**
 * Attaches the `registration`/`registrationError` listeners exactly once
 * (idempotent re-attach via `removeAllListeners`), then calls
 * `PushNotifications.register()` — which never prompts. The `registration`
 * listener is where the server call happens, so this single path handles
 * first registration, every app launch, AND token rotation (FCM
 * `onNewToken` / APNs token changes both surface as a new `registration`
 * event). If the mutation fails (e.g. offline), nothing is stored and the
 * next launch retries naturally.
 */
export const startPushRegistration = async (
  client: ApolloClient<object>,
  locale: string,
  onRegistrationError?: PushRegistrationErrorHandler,
): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
  const PushNotifications = await loadPushPlugin();
  await PushNotifications.removeAllListeners();
  await PushNotifications.addListener('registration', ({ value: token }) =>
    registerDeviceWithApi(client, token, locale).catch((error) =>
      onRegistrationError?.(error),
    ),
  );
  await PushNotifications.addListener('registrationError', (error) =>
    onRegistrationError?.(error),
  );
  await PushNotifications.register();
};

/**
 * User-facing opt-in — the ONLY place in the app allowed to call
 * `requestPermissions()` (prompts on iOS first call / Android 13+).
 * Launch-time re-registration must use `startPushRegistration` after a
 * non-prompting `checkPermissions()` instead.
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
  await startPushRegistration(client, locale, onRegistrationError);
  return 'granted';
};

/**
 * Best-effort teardown — used by the settings "disable" button AND logout.
 * Order matters: the `DestroyUserDevice` mutation runs first (it needs a
 * valid apiToken, and on logout `clearStore()` would drop it), then the
 * plugin unregisters (the device stops receiving even if the DELETE failed),
 * then local storage is cleared. Every step is wrapped so one failure never
 * blocks the next or the caller.
 */
export const disablePush = async (
  client: ApolloClient<object>,
): Promise<void> => {
  if (!isNativeShell()) {
    return;
  }
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
    const PushNotifications = await loadPushPlugin();
    await PushNotifications.removeAllListeners();
    await PushNotifications.unregister();
  } catch {
    // Plugin unavailable or teardown failed — still clear local state below
  }
  clearPushStorage();
};
