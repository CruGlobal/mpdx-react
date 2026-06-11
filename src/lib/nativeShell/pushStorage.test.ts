import {
  clearPushStorage,
  getStoredDeviceId,
  getStoredLocale,
  getStoredToken,
  isPushEnabled,
  setPushEnabled,
  storeRegistration,
} from './pushStorage';

describe('pushStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('isPushEnabled / setPushEnabled', () => {
    it('defaults to false', () => {
      expect(isPushEnabled()).toBe(false);
    });

    it('round-trips true', () => {
      setPushEnabled(true);

      expect(isPushEnabled()).toBe(true);
    });

    it('round-trips back to false', () => {
      setPushEnabled(true);
      setPushEnabled(false);

      expect(isPushEnabled()).toBe(false);
    });

    it('persists under the documented key', () => {
      setPushEnabled(true);

      expect(window.localStorage.getItem('mpdx_push_enabled')).toBe('true');
    });
  });

  describe('storeRegistration', () => {
    it('round-trips device id, token, and locale', () => {
      storeRegistration('device-1', 'token-abc', 'fr-FR');

      expect(getStoredDeviceId()).toBe('device-1');
      expect(getStoredToken()).toBe('token-abc');
      expect(getStoredLocale()).toBe('fr-FR');
    });

    it('persists under the documented keys', () => {
      storeRegistration('device-1', 'token-abc', 'fr-FR');

      expect(window.localStorage.getItem('mpdx_push_device_id')).toBe(
        'device-1',
      );
      expect(window.localStorage.getItem('mpdx_push_token')).toBe('token-abc');
      expect(window.localStorage.getItem('mpdx_push_locale')).toBe('fr-FR');
    });

    it('overwrites a previous registration', () => {
      storeRegistration('device-1', 'token-abc', 'fr-FR');
      storeRegistration('device-2', 'token-def', 'en');

      expect(getStoredDeviceId()).toBe('device-2');
      expect(getStoredToken()).toBe('token-def');
      expect(getStoredLocale()).toBe('en');
    });
  });

  describe('getters with nothing stored', () => {
    it('return null', () => {
      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(getStoredLocale()).toBeNull();
    });
  });

  describe('clearPushStorage', () => {
    it('removes all push keys', () => {
      setPushEnabled(true);
      storeRegistration('device-1', 'token-abc', 'fr-FR');

      clearPushStorage();

      expect(isPushEnabled()).toBe(false);
      expect(getStoredDeviceId()).toBeNull();
      expect(getStoredToken()).toBeNull();
      expect(getStoredLocale()).toBeNull();
    });

    it('does not touch unrelated keys', () => {
      window.localStorage.setItem('unrelated', 'value');
      setPushEnabled(true);

      clearPushStorage();

      expect(window.localStorage.getItem('unrelated')).toBe('value');
    });
  });
});
