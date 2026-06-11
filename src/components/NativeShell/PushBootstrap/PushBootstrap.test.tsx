import React from 'react';
import { act, render } from '@testing-library/react';
import { DeepPartial } from 'ts-essentials';
import {
  emitRegistration,
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { UserDevicePlatformEnum } from 'src/graphql/types.generated';
import { RegisterUserDeviceMutation } from 'src/lib/nativeShell/UserDevice.generated';
import { resetPushRegistrationStateForTesting } from 'src/lib/nativeShell/pushRegistration';
import {
  isPushEnabled,
  setPushEnabled,
  storeRegistration,
} from 'src/lib/nativeShell/pushStorage';
import { PushBootstrap } from './PushBootstrap';

const mockGetInfo = jest.fn();

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: { getInfo: mockGetInfo },
}));

interface Mocks {
  RegisterUserDevice: RegisterUserDeviceMutation;
}

const registerMocks: DeepPartial<Mocks> = {
  RegisterUserDevice: {
    registerUserDevice: { id: 'device-1' },
  },
};

const renderBootstrap = () => {
  const mutationSpy = jest.fn();
  const view = render(
    <GqlMockedProvider<Mocks> mocks={registerMocks} onCall={mutationSpy}>
      <PushBootstrap />
    </GqlMockedProvider>,
  );
  return { ...view, mutationSpy };
};

/**
 * Drains the bootstrap's async effect chain (dynamic import →
 * checkPermissions → startPushRegistration). A zero-delay macrotask
 * guarantees every queued microtask has run, so negative assertions
 * ("never called") are trustworthy.
 */
const flushBootstrap = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

const grantPermission = () =>
  mockPushNotifications.checkPermissions.mockResolvedValue({
    receive: 'granted',
  });

describe('PushBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    resetPushRegistrationStateForTesting();
    mockGetInfo.mockResolvedValue({ version: '1.0.0' });
    mockPushNotifications.checkPermissions.mockResolvedValue({
      receive: 'prompt',
    });
  });

  // INVARIANT (master plan T15): the bootstrap must NEVER prompt the user.
  // requestPermissions is only ever called from the settings card. Asserted
  // at the end of every test below.
  const expectNeverPrompted = () =>
    expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();

  describe('on the web', () => {
    beforeEach(() => {
      setNativePlatform('web');
    });

    it('renders null and never executes any plugin code', async () => {
      // Even with the enabled flag set (e.g. localStorage copied across
      // browsers), the web build must not touch the plugin
      storeRegistration('device-1', 'apns-token', 'en-US');
      setPushEnabled(true);

      const { container, mutationSpy } = renderBootstrap();
      await flushBootstrap();

      expect(container).toBeEmptyDOMElement();
      expect(mockPushNotifications.checkPermissions).not.toHaveBeenCalled();
      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
      expectNeverPrompted();
    });
  });

  describe('native with the enabled flag unset', () => {
    it('does not check permissions or register', async () => {
      setNativePlatform('ios');

      const { container, mutationSpy } = renderBootstrap();
      await flushBootstrap();

      expect(container).toBeEmptyDOMElement();
      expect(mockPushNotifications.checkPermissions).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
      expectNeverPrompted();
    });
  });

  describe('native with the enabled flag set and permission granted', () => {
    beforeEach(() => {
      setNativePlatform('ios');
      storeRegistration('device-1', 'apns-token', 'en-US');
      setPushEnabled(true);
      grantPermission();
    });

    it('silently re-registers without prompting', async () => {
      renderBootstrap();
      await flushBootstrap();

      expect(mockPushNotifications.checkPermissions).toHaveBeenCalled();
      expect(mockPushNotifications.register).toHaveBeenCalled();
      expectNeverPrompted();
    });

    it('POSTs one upserting registration per launch, even when the token and locale are unchanged', async () => {
      const { mutationSpy } = renderBootstrap();
      await flushBootstrap();

      // The OS re-issues the same token on a steady-state relaunch. The
      // first registration of the session must still POST (the backend
      // upsert fixes ownership after a user switch and recreates
      // server-deleted device rows)…
      await emitRegistration('apns-token');
      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'apns-token',
          version: '1.0.0',
          locale: 'en-US',
        },
      });

      // …but repeat events within the session short-circuit
      await emitRegistration('apns-token');
      const registerCalls = mutationSpy.mock.calls.filter(
        ([call]) => call.operation.operationName === 'RegisterUserDevice',
      );
      expect(registerCalls).toHaveLength(1);
      expectNeverPrompted();
    });

    it('re-POSTs the device when the token rotates', async () => {
      const { mutationSpy } = renderBootstrap();
      await flushBootstrap();

      await emitRegistration('rotated-token');

      expect(mutationSpy).toHaveGraphqlOperation('RegisterUserDevice', {
        input: {
          platform: UserDevicePlatformEnum.Apns,
          token: 'rotated-token',
          version: '1.0.0',
          locale: 'en-US',
        },
      });
      expectNeverPrompted();
    });
  });

  describe('native with the enabled flag set but permission revoked at the OS', () => {
    it('is a silent no-op that preserves local state for the settings card', async () => {
      setNativePlatform('ios');
      storeRegistration('device-1', 'apns-token', 'en-US');
      setPushEnabled(true);
      mockPushNotifications.checkPermissions.mockResolvedValue({
        receive: 'denied',
      });

      const { container, mutationSpy } = renderBootstrap();
      await flushBootstrap();

      expect(container).toBeEmptyDOMElement();
      expect(mockPushNotifications.checkPermissions).toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mutationSpy).not.toHaveBeenCalled();
      // The settings card owns recovering from a revoke; bootstrap leaves the
      // opt-in flag alone
      expect(isPushEnabled()).toBe(true);
      expectNeverPrompted();
    });
  });

  describe('invariant', () => {
    it('never calls requestPermissions, even on the fully-enabled happy path', async () => {
      setNativePlatform('ios');
      storeRegistration('device-1', 'apns-token', 'en-US');
      setPushEnabled(true);
      grantPermission();

      renderBootstrap();
      await flushBootstrap();
      await emitRegistration('rotated-token');
      await flushBootstrap();

      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
    });
  });
});
