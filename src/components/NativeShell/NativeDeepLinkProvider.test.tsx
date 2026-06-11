import { NextRouter } from 'next/router';
import React from 'react';
import { act, render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import {
  mockCapacitorCore,
  mockPushNotifications,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import {
  NativeDeepLinkProvider,
  resetLaunchUrlLatchForTesting,
} from './NativeDeepLinkProvider';

type AppUrlOpenHandler = (event: { url: string }) => void | Promise<void>;
type PushActionHandler = (event: {
  actionId: string;
  notification: { data: unknown };
}) => void | Promise<void>;

const mockAppListenerHandles: Array<{ remove: jest.Mock }> = [];
const mockAppAddListener = jest.fn(
  async (_eventName: string, _handler: AppUrlOpenHandler) => {
    const handle = { remove: jest.fn(async () => undefined) };
    mockAppListenerHandles.push(handle);
    return handle;
  },
);
const mockGetLaunchUrl = jest.fn(
  async (): Promise<{ url: string } | undefined> => undefined,
);

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: { addListener: mockAppAddListener, getLaunchUrl: mockGetLaunchUrl },
}));

const renderProvider = (router: Partial<NextRouter> = {}) => {
  const push = jest.fn().mockResolvedValue(true);
  const replace = jest.fn().mockResolvedValue(true);
  const view = render(
    <TestRouter router={{ asPath: '/', push, replace, ...router }}>
      <NativeDeepLinkProvider />
    </TestRouter>,
  );
  return { ...view, push, replace };
};

/**
 * Drains the provider's async effect chain (dynamic plugin imports →
 * addListener registrations → getLaunchUrl). A zero-delay macrotask
 * guarantees every queued microtask has run, so negative assertions
 * ("never navigated") are trustworthy.
 */
const flushEffects = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

/** Fires attached 'appUrlOpen' listeners, like a universal-link tap would. */
const emitAppUrlOpen = (url: string) =>
  act(async () => {
    for (const [eventName, handler] of mockAppAddListener.mock.calls) {
      if (eventName === 'appUrlOpen') {
        await handler({ url });
      }
    }
  });

/** Fires attached 'pushNotificationActionPerformed' listeners. */
const emitPushAction = (actionId: string, data: unknown) =>
  act(async () => {
    for (const [eventName, handler] of mockPushNotifications.addListener.mock
      .calls) {
      if (eventName === 'pushNotificationActionPerformed') {
        await (handler as unknown as PushActionHandler)({
          actionId,
          notification: { data },
        });
      }
    }
  });

describe('NativeDeepLinkProvider', () => {
  beforeEach(() => {
    resetLaunchUrlLatchForTesting();
    mockAppListenerHandles.length = 0;
    mockGetLaunchUrl.mockResolvedValue(undefined);
  });

  describe('on the web', () => {
    beforeEach(() => {
      setNativePlatform('web');
    });

    it('renders null and never touches the plugins', async () => {
      const { container, push, replace } = renderProvider();
      await flushEffects();

      expect(container).toBeEmptyDOMElement();
      expect(mockAppAddListener).not.toHaveBeenCalled();
      expect(mockGetLaunchUrl).not.toHaveBeenCalled();
      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    });
  });

  describe('in the native shell', () => {
    beforeEach(() => {
      setNativePlatform('ios');
    });

    describe('appUrlOpen (warm-start universal links)', () => {
      it('routes an allowed-host URL to its in-app path', async () => {
        const { push } = renderProvider();
        await flushEffects();

        // jsdom's origin host is 'localhost' — the allowed host
        await emitAppUrlOpen(
          'https://localhost/accountLists/al-1/contacts/c-1?tab=Donations',
        );

        expect(push).toHaveBeenCalledWith(
          '/accountLists/al-1/contacts/c-1?tab=Donations',
        );
      });

      it('ignores a foreign-host URL', async () => {
        const { push, replace } = renderProvider();
        await flushEffects();

        await emitAppUrlOpen('https://evil.com/accountLists/al-1');

        expect(push).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
      });
    });

    describe('pushNotificationActionPerformed (push taps)', () => {
      it('routes a tap to its data.deepLink, ignoring transport bookkeeping keys', async () => {
        const { push } = renderProvider();
        await flushEffects();

        // data is the full APNs userInfo / FCM data map — a superset of our
        // custom keys (verified plugin payload mapping)
        await emitPushAction('tap', {
          deepLink: '/accountLists/al-1/contacts/c-1?tab=Donations',
          aps: { alert: 'You have a gift' },
          'google.message_id': 'msg-1',
          from: '123456',
          link: { data: 'legacy' },
        });

        expect(push).toHaveBeenCalledWith(
          '/accountLists/al-1/contacts/c-1?tab=Donations',
        );
      });

      it('falls back to /accountLists when deepLink is missing', async () => {
        const { push } = renderProvider();
        await flushEffects();

        await emitPushAction('tap', { 'google.message_id': 'msg-1' });

        expect(push).toHaveBeenCalledWith('/accountLists');
      });

      it('ignores non-tap actions', async () => {
        const { push, replace } = renderProvider();
        await flushEffects();

        await emitPushAction('dismiss', { deepLink: '/accountLists/al-1' });

        expect(push).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
      });

      it('skips navigation when the target equals the current asPath', async () => {
        const { push } = renderProvider({ asPath: '/accountLists/al-1' });
        await flushEffects();

        await emitPushAction('tap', { deepLink: '/accountLists/al-1' });

        expect(push).not.toHaveBeenCalled();
      });
    });

    describe('getLaunchUrl (cold-start universal links)', () => {
      it('replaces to the launch URL exactly once across remounts', async () => {
        mockGetLaunchUrl.mockResolvedValue({
          url: 'https://localhost/accountLists/al-1',
        });

        const first = renderProvider();
        await flushEffects();

        expect(first.replace).toHaveBeenCalledTimes(1);
        expect(first.replace).toHaveBeenCalledWith('/accountLists/al-1');
        expect(first.push).not.toHaveBeenCalled();

        first.unmount();
        const second = renderProvider();
        await flushEffects();

        // The module-level latch survives the remount (StrictMode guard)
        expect(second.replace).not.toHaveBeenCalled();
        expect(second.push).not.toHaveBeenCalled();
      });

      it('does not navigate on a foreign-host launch URL', async () => {
        mockGetLaunchUrl.mockResolvedValue({
          url: 'https://evil.com/accountLists/al-1',
        });

        const { push, replace } = renderProvider();
        await flushEffects();

        expect(push).not.toHaveBeenCalled();
        expect(replace).not.toHaveBeenCalled();
      });
    });

    describe('cleanup', () => {
      it('removes both plugin listeners on unmount', async () => {
        const { unmount } = renderProvider();
        await flushEffects();

        expect(mockAppListenerHandles).toHaveLength(1);
        const pushHandle = await mockPushNotifications.addListener.mock
          .results[0].value;

        unmount();

        expect(mockAppListenerHandles[0].remove).toHaveBeenCalled();
        expect(pushHandle.remove).toHaveBeenCalled();
      });
    });
  });
});
