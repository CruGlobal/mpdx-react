import { AppProps } from 'next/app';
import { NextRouter } from 'next/router';
import React, { ReactElement, ReactNode } from 'react';
import { act, render } from '@testing-library/react';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import {
  mockCapacitorCore,
  mockPushNotifications,
  mockSplashScreen,
  mockStatusBar,
  setNativePlatform,
} from '__tests__/util/capacitorMocks';
import { resetLaunchUrlLatchForTesting } from 'src/components/NativeShell/NativeDeepLinkProvider';
import { MIN_SUPPORTED_SHELL_VERSION } from 'src/lib/nativeShell/shellVersion';
import App, { PageWithLayout } from './_app.page';

const mockAppAddListener = jest.fn(async () => ({
  remove: jest.fn(async () => undefined),
}));
const mockGetLaunchUrl = jest.fn(
  async (): Promise<{ url: string } | undefined> => undefined,
);
const mockGetInfo = jest.fn(async () => ({ version: '1.0.0' }));

// @serwist/window is ESM-only and untransformed by Jest; the service worker
// is disabled in the test environment so the class is never instantiated.
jest.mock('@serwist/window', () => ({ Serwist: jest.fn() }));

jest.mock('@capacitor/core', () => mockCapacitorCore);
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));
jest.mock('@capacitor/app', () => ({
  App: {
    addListener: mockAppAddListener,
    getLaunchUrl: mockGetLaunchUrl,
    getInfo: mockGetInfo,
  },
}));
jest.mock('@capacitor/splash-screen', () => ({
  SplashScreen: mockSplashScreen,
}));
// requireActual would load the real plugin, which imports @capacitor/core
// before the mocks above initialize — so re-declare the tiny enum inline.
jest.mock('@capacitor/status-bar', () => ({
  StatusBar: mockStatusBar,
  Style: { Dark: 'DARK', Light: 'LIGHT', Default: 'DEFAULT' },
}));

// The real makeClient performs a top-level await of the cache persistor and
// talks to the network. The providers under test render their children while
// queries are loading, so a client whose link never emits keeps the full
// provider tree mounted without any network traffic.
jest.mock('src/lib/apollo/client', () => {
  const { ApolloClient, ApolloLink, InMemoryCache, Observable } =
    jest.requireActual('@apollo/client');
  return {
    __esModule: true,
    default: jest.fn(
      () =>
        new ApolloClient({
          cache: new InMemoryCache(),
          link: new ApolloLink(() => new Observable(() => undefined)),
        }),
    ),
  };
});

// The global setup mock of next-auth/react does not include SessionProvider,
// which _app renders, so re-mock with a pass-through provider added.
jest.mock('next-auth/react', () => {
  const { session: mockSession } = jest.requireActual(
    '__tests__/fixtures/session',
  );
  return {
    getSession: jest.fn().mockResolvedValue(mockSession),
    useSession: jest.fn().mockReturnValue({
      status: 'authenticated',
      data: mockSession,
      update: () => Promise.resolve(null),
    }),
    signIn: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
    SessionProvider: ({ children }: { children: ReactNode }) => children,
  };
});

const TestLayout = ({ children }: { children?: ReactNode }): ReactElement => (
  <div data-testid="test-layout">{children}</div>
);

const TestPage: PageWithLayout = () => (
  <div data-testid="page-content">Page content</div>
);
TestPage.layout = TestLayout;

const testRouter: Partial<NextRouter> = {
  pathname: '/accountLists/[accountListId]',
  route: '/accountLists/[accountListId]',
  asPath: '/accountLists/account-list-1',
  query: { accountListId: 'account-list-1' },
};

const renderApp = () =>
  render(
    <TestRouter router={testRouter}>
      <App
        Component={TestPage}
        pageProps={{ session }}
        router={testRouter as unknown as AppProps['router']}
      />
    </TestRouter>,
  );

/**
 * Drains the native components' async effect chains (dynamic plugin imports →
 * listener registrations). A zero-delay macrotask guarantees every queued
 * microtask has run, so negative assertions ("plugin never touched") are
 * trustworthy.
 */
const flushEffects = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

const browserUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

const setUserAgent = (userAgent: string) =>
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);

describe('App', () => {
  beforeEach(() => {
    resetLaunchUrlLatchForTesting();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('on the web', () => {
    beforeEach(() => {
      setNativePlatform('web');
      setUserAgent(browserUserAgent);
    });

    it('renders the page tree unchanged and never touches native plugin code', async () => {
      const { findByTestId, queryByText } = renderApp();
      await flushEffects();

      // The page renders normally and the shell upgrade gate stays out of the way
      expect(await findByTestId('page-content')).toBeInTheDocument();
      expect(queryByText('Update Required')).not.toBeInTheDocument();

      // Native chrome helpers are inert in the browser
      expect(mockSplashScreen.hide).not.toHaveBeenCalled();
      expect(mockStatusBar.setStyle).not.toHaveBeenCalled();
      expect(mockStatusBar.setOverlaysWebView).not.toHaveBeenCalled();
      expect(mockStatusBar.setBackgroundColor).not.toHaveBeenCalled();

      // Deep-link routing and push registration are inert in the browser
      expect(mockAppAddListener).not.toHaveBeenCalled();
      expect(mockGetLaunchUrl).not.toHaveBeenCalled();
      expect(mockPushNotifications.addListener).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
    });
  });

  describe('in the native shell', () => {
    beforeEach(() => {
      setNativePlatform('ios');
      setUserAgent(
        `${browserUserAgent} MPDXShell/${MIN_SUPPORTED_SHELL_VERSION}`,
      );
    });

    it('hides the splash screen and styles the status bar after hydration', async () => {
      const { findByTestId } = renderApp();
      await flushEffects();

      expect(await findByTestId('page-content')).toBeInTheDocument();
      expect(mockSplashScreen.hide).toHaveBeenCalledTimes(1);
      expect(mockStatusBar.setStyle).toHaveBeenCalledWith({ style: 'DARK' });
    });

    it('mounts deep-link routing inside the providers', async () => {
      renderApp();
      await flushEffects();

      expect(mockAppAddListener).toHaveBeenCalledWith(
        'appUrlOpen',
        expect.any(Function),
      );
      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'pushNotificationActionPerformed',
        expect.any(Function),
      );
      expect(mockGetLaunchUrl).toHaveBeenCalled();
    });

    it('silently re-registers push for an opted-in device without ever prompting', async () => {
      window.localStorage.setItem('mpdx_push_enabled', 'true');
      mockPushNotifications.checkPermissions.mockResolvedValueOnce({
        receive: 'granted',
      });

      renderApp();
      await flushEffects();

      expect(mockPushNotifications.register).toHaveBeenCalledTimes(1);
      // Invariant: the bootstrap never prompts — only the settings card may
      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
    });

    it('does not register push when the user has not opted in', async () => {
      renderApp();
      await flushEffects();

      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(mockPushNotifications.requestPermissions).not.toHaveBeenCalled();
    });

    it('blocks the page tree with the upgrade screen when the shell is below the minimum version', async () => {
      setUserAgent(`${browserUserAgent} MPDXShell/0.0.1`);

      const { findByText, queryByTestId } = renderApp();
      await flushEffects();

      expect(await findByText('Update Required')).toBeInTheDocument();
      // Sign out stays reachable — the screen must never block it
      expect(await findByText('Sign Out')).toBeInTheDocument();
      expect(queryByTestId('page-content')).not.toBeInTheDocument();
      // The blocked tree mounts no shell wiring
      expect(mockAppAddListener).not.toHaveBeenCalled();
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
    });
  });
});
