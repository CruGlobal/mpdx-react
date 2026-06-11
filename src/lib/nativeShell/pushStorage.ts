/**
 * localStorage-backed state for push device registration.
 *
 * These keys deliberately live OUTSIDE Apollo/IndexedDB: `clearApolloData()`
 * (cachePersistor purge + clearStore) must not race with reading the device
 * id during logout — the `DELETE /user/devices/:id` call needs the stored id
 * while the Apollo cache is being torn down.
 */

const PUSH_ENABLED_KEY = 'mpdx_push_enabled';
const PUSH_DEVICE_ID_KEY = 'mpdx_push_device_id';
const PUSH_TOKEN_KEY = 'mpdx_push_token';
const PUSH_LOCALE_KEY = 'mpdx_push_locale';

/** True when the user opted in to push on this device (gates launch-time auto-register). */
export const isPushEnabled = (): boolean =>
  window.localStorage.getItem(PUSH_ENABLED_KEY) === 'true';

export const setPushEnabled = (enabled: boolean): void => {
  if (enabled) {
    window.localStorage.setItem(PUSH_ENABLED_KEY, 'true');
  } else {
    window.localStorage.removeItem(PUSH_ENABLED_KEY);
  }
};

/** Server id from the device create response — needed for DELETE on logout/disable. */
export const getStoredDeviceId = (): string | null =>
  window.localStorage.getItem(PUSH_DEVICE_ID_KEY);

/** Last token successfully registered — used to skip redundant POSTs. */
export const getStoredToken = (): string | null =>
  window.localStorage.getItem(PUSH_TOKEN_KEY);

/** Locale sent at registration — re-register if the user changes language. */
export const getStoredLocale = (): string | null =>
  window.localStorage.getItem(PUSH_LOCALE_KEY);

/** Records a successful device registration. */
export const storeRegistration = (
  deviceId: string,
  token: string,
  locale: string,
): void => {
  window.localStorage.setItem(PUSH_DEVICE_ID_KEY, deviceId);
  window.localStorage.setItem(PUSH_TOKEN_KEY, token);
  window.localStorage.setItem(PUSH_LOCALE_KEY, locale);
};

/** Removes all push registration state (used by disablePush and logout). */
export const clearPushStorage = (): void => {
  window.localStorage.removeItem(PUSH_ENABLED_KEY);
  window.localStorage.removeItem(PUSH_DEVICE_ID_KEY);
  window.localStorage.removeItem(PUSH_TOKEN_KEY);
  window.localStorage.removeItem(PUSH_LOCALE_KEY);
};
