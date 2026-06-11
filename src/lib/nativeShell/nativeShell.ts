import { Capacitor } from '@capacitor/core';

/**
 * Platform detection for the Capacitor native shell.
 *
 * This file is the ONLY place in the codebase that statically imports
 * `@capacitor/core` (master plan §3.4 R1). Everything else must gate on
 * `isNativeShell()` and load Capacitor plugins via dynamic `import()` so the
 * web bundle never downloads plugin code.
 */

/** True when running inside the Capacitor iOS/Android shell, false in any browser. */
export const isNativeShell = (): boolean => Capacitor.isNativePlatform();

/**
 * True only inside the Android shell. Used to gate Android-only plugin calls
 * (e.g. `StatusBar.setBackgroundColor`) that reject on iOS.
 */
export const isAndroidShell = (): boolean =>
  Capacitor.getPlatform() === 'android';

/**
 * The SNS platform name for device registration against
 * `/api/v2/user/devices`: 'APNS' on iOS, 'GCM' on Android (Android FCM tokens
 * register under the SNS 'GCM' platform name — do not "fix" it), null on web.
 */
export const getDevicePlatform = (): 'APNS' | 'GCM' | null => {
  switch (Capacitor.getPlatform()) {
    case 'ios':
      return 'APNS';
    case 'android':
      return 'GCM';
    default:
      return null;
  }
};
