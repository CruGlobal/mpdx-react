import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonatorRole } from 'src/lib/impersonationAccess';
import { UserOptionQuery } from './UserPreference.generated';
import { useNavPages } from './useNavPages';

const accountListId = 'account-list-1';

// Wrapper for asserting HR Tools visibility by user type (verified, reports enabled)
const makeWrapper = (userType: UserTypeEnum, userTypeVerified = 'true') => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter router={{ query: { accountListId }, isReady: true }}>
      <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
        mocks={{
          GetUser: { user: { userType } },
          UserOption: {
            userOption: { key: 'user_type_verified', value: userTypeVerified },
          },
        }}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  wrapper.displayName = 'NavPagesWrapper';
  return wrapper;
};

const nonUsStaffUser = {
  userType: UserTypeEnum.GlobalStaff,
  usStaffGroup: null,
  spouseUsStaffGroup: null,
  staffAccountId: null,
};

const Wrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: nonUsStaffUser },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'true' },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

const ReportsDisabledWrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: nonUsStaffUser },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'false' },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

describe('useNavPages', () => {
  afterEach(() => {
    // mockSession uses mockReturnValue, which clearMocks does not reset
    mockSession({});
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it('shows the HR Tools tab for a us staff user', async () => {
    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.UsStaff),
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('shows the HR Tools tab for a hybrid staff user', async () => {
    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.HybridStaff),
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('hides the HR Tools tab for a non-US Staff user when not in a development env', async () => {
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('hides the HR Tools tab for a non-US Staff non-developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });

  it('shows the HR Tools tab for a non-US Staff developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: Wrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).toContain(
      'hr-tools-page',
    );
  });

  it('shows the HR Tools tab for a developer when reports are disabled', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: ReportsDisabledWrapper,
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );
  });

  it('shows only Partner Reminders in the HR Tools tab when reports are disabled', async () => {
    mockSession({ developer: false });

    const { result, waitFor } = renderHook(() => useNavPages(false), {
      wrapper: makeWrapper(UserTypeEnum.UsStaff, 'false'),
    });

    await waitFor(() =>
      expect(result.current.navPages.map((page) => page.id)).toContain(
        'hr-tools-page',
      ),
    );

    const hrToolsPage = result.current.navPages.find(
      (page) => page.id === 'hr-tools-page',
    );
    expect(hrToolsPage?.items?.map((item) => item.id)).toEqual([
      'partnerReminders',
    ]);
  });

  describe('Contacts and Tasks while impersonating', () => {
    const renderNavPageIds = async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useNavPages(false),
        { wrapper: makeWrapper(UserTypeEnum.UsStaff) },
      );
      await waitForNextUpdate();
      return result.current;
    };

    it.each([ImpersonatorRole.MpdLeader, ImpersonatorRole.HrLeader])(
      'hides the Contacts and Tasks tabs from a %s impersonator',
      async (impersonatorRole) => {
        mockSession({ impersonating: true, impersonatorRole });

        const { navPages, searchDialogPages } = await renderNavPageIds();

        const ids = navPages.map((page) => page.id);
        expect(ids).not.toContain('contacts-page');
        expect(ids).not.toContain('tasks-page');
        // The dashboard and reports stay
        expect(ids).toContain('dashboard-page');
        expect(ids).toContain('reports-page');
        // The search dialog follows the same filter
        const searchTitles = searchDialogPages.map((page) => page.title);
        expect(searchTitles).not.toContain('Contacts');
        expect(searchTitles).not.toContain('Tasks');
      },
    );

    it.each([ImpersonatorRole.HelpdeskAdmin, ImpersonatorRole.Developer])(
      'shows the Contacts and Tasks tabs to a %s impersonator',
      async (impersonatorRole) => {
        mockSession({ impersonating: true, impersonatorRole });

        const { navPages } = await renderNavPageIds();

        const ids = navPages.map((page) => page.id);
        expect(ids).toContain('contacts-page');
        expect(ids).toContain('tasks-page');
      },
    );

    it('hides the Contacts and Tasks tabs from an impersonator with no known role', async () => {
      mockSession({ impersonating: true, impersonatorRole: undefined });

      const { navPages } = await renderNavPageIds();

      const ids = navPages.map((page) => page.id);
      expect(ids).not.toContain('contacts-page');
      expect(ids).not.toContain('tasks-page');
    });

    it('shows the Contacts and Tasks tabs when not impersonating', async () => {
      mockSession({ impersonating: false });

      const { navPages } = await renderNavPageIds();

      const ids = navPages.map((page) => page.id);
      expect(ids).toContain('contacts-page');
      expect(ids).toContain('tasks-page');
    });
  });

  describe('Settings while impersonating', () => {
    const renderPages = async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useNavPages(false),
        { wrapper: makeWrapper(UserTypeEnum.UsStaff) },
      );
      await waitForNextUpdate();
      return result.current;
    };

    const settingsSearchTitles = [
      'Preferences',
      'Preferences - Notifications',
      'Preferences - Connect Services',
      'Preferences - Manage Accounts',
      'Preferences - Manage Coaches',
    ];

    it.each([ImpersonatorRole.MpdLeader, ImpersonatorRole.HrLeader])(
      'hides the settings entries from a %s impersonator',
      async (impersonatorRole) => {
        mockSession({ impersonating: true, impersonatorRole });

        const { searchDialogPages, panelPages } = await renderPages();

        const searchTitles = searchDialogPages.map((page) => page.title);
        settingsSearchTitles.forEach((title) =>
          expect(searchTitles).not.toContain(title),
        );
        expect(panelPages).toEqual([]);
      },
    );

    it('hides the settings entries from an impersonator with no known role', async () => {
      mockSession({ impersonating: true, impersonatorRole: undefined });

      const { searchDialogPages, panelPages } = await renderPages();

      const searchTitles = searchDialogPages.map((page) => page.title);
      expect(searchTitles).not.toContain('Preferences');
      expect(panelPages).toEqual([]);
    });

    it.each([ImpersonatorRole.HelpdeskAdmin, ImpersonatorRole.Developer])(
      'shows the settings entries to a %s impersonator',
      async (impersonatorRole) => {
        mockSession({ impersonating: true, impersonatorRole });

        const { searchDialogPages, panelPages } = await renderPages();

        const searchTitles = searchDialogPages.map((page) => page.title);
        settingsSearchTitles.forEach((title) =>
          expect(searchTitles).toContain(title),
        );
        expect(panelPages.map((page) => page.title)).toEqual(['Preferences']);
      },
    );

    it('shows the settings entries when not impersonating', async () => {
      mockSession({ impersonating: false });

      const { searchDialogPages, panelPages } = await renderPages();

      expect(searchDialogPages.map((page) => page.title)).toContain(
        'Preferences',
      );
      expect(panelPages.map((page) => page.title)).toEqual(['Preferences']);
    });
  });
});
