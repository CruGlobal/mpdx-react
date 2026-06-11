import {
  emitPushNotificationActionPerformed,
  emitRegistration,
  emitRegistrationError,
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from './capacitorMocks';

describe('capacitorMocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe('listener removal semantics', () => {
    it('stops emitting to a listener after handle.remove()', async () => {
      const handler = jest.fn();
      const handle = await mockPushNotifications.addListener(
        'registration',
        handler,
      );

      await handle.remove();
      await emitRegistration('token-123');

      expect(handler).not.toHaveBeenCalled();
    });

    it('keeps emitting to listeners whose handles were not removed', async () => {
      const removed = jest.fn();
      const surviving = jest.fn();
      const handle = await mockPushNotifications.addListener(
        'registration',
        removed,
      );
      await mockPushNotifications.addListener('registration', surviving);

      await handle.remove();
      await emitRegistration('token-123');

      expect(removed).not.toHaveBeenCalled();
      expect(surviving).toHaveBeenCalledWith({ value: 'token-123' });
    });

    it('removeAllListeners() detaches every listener, regardless of owner', async () => {
      const registration = jest.fn();
      const pushAction = jest.fn();
      await mockPushNotifications.addListener('registration', registration);
      await mockPushNotifications.addListener(
        'pushNotificationActionPerformed',
        pushAction,
      );

      await mockPushNotifications.removeAllListeners();
      await emitRegistration('token-123');
      await emitPushNotificationActionPerformed('tap', { deepLink: '/x' });

      expect(registration).not.toHaveBeenCalled();
      expect(pushAction).not.toHaveBeenCalled();
    });
  });

  describe('emitPushNotificationActionPerformed', () => {
    it('invokes pushNotificationActionPerformed listeners like a tap would', async () => {
      const handler = jest.fn();
      await mockPushNotifications.addListener(
        'pushNotificationActionPerformed',
        handler,
      );

      await emitPushNotificationActionPerformed('tap', { deepLink: '/a' });

      expect(handler).toHaveBeenCalledWith({
        actionId: 'tap',
        notification: { data: { deepLink: '/a' } },
      });
    });
  });

  describe('mockPushNotifications defaults', () => {
    it('resolves permission checks and registration calls', async () => {
      await expect(mockPushNotifications.checkPermissions()).resolves.toEqual({
        receive: 'prompt',
      });
      await expect(mockPushNotifications.requestPermissions()).resolves.toEqual(
        { receive: 'granted' },
      );
      await expect(mockPushNotifications.register()).resolves.toBeUndefined();
      await expect(mockPushNotifications.unregister()).resolves.toBeUndefined();
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
