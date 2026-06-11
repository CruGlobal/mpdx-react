import {
  emitRegistration,
  emitRegistrationError,
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from './capacitorMocks';

describe('capacitorMocks', () => {
  describe('setNativePlatform + mockCapacitorCore', () => {
    it('defaults to web', () => {
      expect(mockCapacitorCore.Capacitor.isNativePlatform()).toBe(false);
      expect(mockCapacitorCore.Capacitor.getPlatform()).toBe('web');
    });

    it.each([
      ['ios', true],
      ['android', true],
      ['web', false],
    ] as const)(
      'drives getPlatform/isNativePlatform for %s',
      (platform, native) => {
        setNativePlatform(platform);

        expect(mockCapacitorCore.Capacitor.getPlatform()).toBe(platform);
        expect(mockCapacitorCore.Capacitor.isNativePlatform()).toBe(native);
      },
    );
  });

  describe('emitRegistration', () => {
    it('invokes registration listeners with the token like the OS would', async () => {
      const handler = jest.fn();
      await mockPushNotifications.addListener('registration', handler);

      await emitRegistration('token-123');

      expect(handler).toHaveBeenCalledWith({ value: 'token-123' });
    });

    it('does not invoke listeners for other events', async () => {
      const errorHandler = jest.fn();
      await mockPushNotifications.addListener(
        'registrationError',
        errorHandler,
      );

      await emitRegistration('token-123');

      expect(errorHandler).not.toHaveBeenCalled();
    });

    it('is a no-op when no listener is attached', async () => {
      await expect(emitRegistration('token-123')).resolves.toBeUndefined();
    });
  });

  describe('emitRegistrationError', () => {
    it('invokes registrationError listeners with the error', async () => {
      const handler = jest.fn();
      await mockPushNotifications.addListener('registrationError', handler);

      await emitRegistrationError('boom');

      expect(handler).toHaveBeenCalledWith({ error: 'boom' });
    });
  });

  describe('mockPushNotifications defaults', () => {
    it('resolves permission checks and registration calls', async () => {
      await expect(mockPushNotifications.checkPermissions()).resolves.toEqual({
        receive: 'prompt',
      });
      await expect(
        mockPushNotifications.requestPermissions(),
      ).resolves.toEqual({ receive: 'granted' });
      await expect(mockPushNotifications.register()).resolves.toBeUndefined();
      await expect(
        mockPushNotifications.unregister(),
      ).resolves.toBeUndefined();
      await expect(
        mockPushNotifications.removeAllListeners(),
      ).resolves.toBeUndefined();
    });

    it('returns a removable listener handle', async () => {
      const handle = await mockPushNotifications.addListener(
        'registration',
        jest.fn(),
      );

      await expect(handle.remove()).resolves.toBeUndefined();
    });
  });
});
