import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import {
  AssistantSettingsFieldsFragment,
  AssistantSettingsQuery,
} from './AssistantSettings.generated';
import { assistantSettingsMock } from './AssistantSettings.mock';
import {
  useAssistantAccess,
  useAssistantVisibility,
} from './useAssistantVisibility';

const mutationSpy = jest.fn();

const makeWrapper = (
  settings: Partial<AssistantSettingsFieldsFragment> = {},
  query: Record<string, string> = { accountListId: 'account-list-1' },
) => {
  const Wrapper = ({ children }: { children: React.ReactElement }) => (
    <TestRouter router={{ query }}>
      <GqlMockedProvider<{ AssistantSettings: AssistantSettingsQuery }>
        mocks={{
          AssistantSettings: {
            assistantSettings: assistantSettingsMock(settings),
          },
        }}
        onCall={mutationSpy}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  return Wrapper;
};

const expectNoSettingsQuery = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(mutationSpy).not.toHaveGraphqlOperation('AssistantSettings');
};

describe('useAssistantVisibility', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'true';
    process.env.DISABLE_ASSISTANT = 'false';
    delete process.env.ASSISTANT_BETA_DEVELOPERS_ONLY;
    mockSession({ developer: true, impersonating: false });
  });

  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_ASSISTANT = 'false';
    delete process.env.ASSISTANT_BETA_DEVELOPERS_ONLY;
  });

  it('shows the inert launcher to an eligible user who has not opted in', async () => {
    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.launcher).toBe('optIn'));
    expect(result.current.settings).toMatchObject({ enabled: false });
    expect(mutationSpy).toHaveGraphqlOperation('AssistantSettings');
  });

  it('shows the drawer launcher once the user has opted in', async () => {
    const { result } = renderHook(
      () => ({
        access: useAssistantAccess(),
        visible: useAssistantVisibility(),
      }),
      { wrapper: makeWrapper({ enabled: true }) },
    );

    await waitFor(() => expect(result.current.access.launcher).toBe('enabled'));
    expect(result.current.visible).toBe(true);
  });

  it('keeps the drawer closed until the user opts in', async () => {
    const { result } = renderHook(
      () => ({
        access: useAssistantAccess(),
        visible: useAssistantVisibility(),
      }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.access.launcher).toBe('optIn'));
    expect(result.current.visible).toBe(false);
  });

  it('hides the launcher when the user hid it, but still returns the settings', async () => {
    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper({ enabled: true, launcherHidden: true }),
    });

    await waitFor(() => expect(result.current.settings).not.toBeNull());
    expect(result.current.launcher).toBe('hidden');
  });

  it('is hidden and skips the query when DISABLE_ASSISTANT is on', async () => {
    process.env.DISABLE_ASSISTANT = 'true';

    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper({ enabled: true }),
    });

    await expectNoSettingsQuery();
    expect(result.current).toEqual({ launcher: 'hidden', settings: null });
  });

  it('is hidden and skips the query when impersonating', async () => {
    mockSession({ developer: true, impersonating: true });

    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper({ enabled: true }),
    });

    await expectNoSettingsQuery();
    expect(result.current).toEqual({ launcher: 'hidden', settings: null });
  });

  describe('rollout gate', () => {
    it('hides the assistant from non-developers while the gate is on', async () => {
      mockSession({ developer: false });

      const { result } = renderHook(() => useAssistantAccess(), {
        wrapper: makeWrapper(),
      });

      await expectNoSettingsQuery();
      expect(result.current.launcher).toBe('hidden');
    });

    it('hides the assistant from developers outside a development env while the gate is on', async () => {
      process.env.DEVELOPMENT_ENV = 'false';

      const { result } = renderHook(() => useAssistantAccess(), {
        wrapper: makeWrapper(),
      });

      await expectNoSettingsQuery();
      expect(result.current.launcher).toBe('hidden');
    });

    it('shows the inert launcher to everyone once the gate is off', async () => {
      process.env.ASSISTANT_BETA_DEVELOPERS_ONLY = 'false';
      process.env.DEVELOPMENT_ENV = 'false';
      mockSession({ developer: false });

      const { result } = renderHook(() => useAssistantAccess(), {
        wrapper: makeWrapper(),
      });

      await waitFor(() => expect(result.current.launcher).toBe('optIn'));
    });
  });

  it('skips the query when there is no session', async () => {
    (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: () => Promise.resolve(null),
    });

    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper({ enabled: true }),
    });

    await expectNoSettingsQuery();
    expect(result.current.launcher).toBe('hidden');
  });

  it('skips the query when there is no account list', async () => {
    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: makeWrapper({ enabled: true }, {}),
    });

    await expectNoSettingsQuery();
    expect(result.current.launcher).toBe('hidden');
  });

  it('is hidden without an Apollo client, as on the login page', () => {
    const { result } = renderHook(() => useAssistantAccess(), {
      wrapper: ({ children }) => <TestRouter>{children}</TestRouter>,
    });

    expect(result.current).toEqual({ launcher: 'hidden', settings: null });
  });
});
