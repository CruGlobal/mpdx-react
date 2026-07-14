import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useNavPages } from './useNavPages';

const accountListId = 'account-list-1';

// Wrapper for asserting HR Tools visibility by user type (verified, reports enabled)
const makeWrapper = (userType: UserTypeEnum) => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter router={{ query: { accountListId }, isReady: true }}>
      <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
        mocks={{
          GetUser: { user: { userType } },
          UserOption: {
            userOption: { key: 'user_type_verified', value: 'true' },
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

  it('keeps the HR Tools tab hidden for a developer when reports are disabled', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(() => useNavPages(false), {
      wrapper: ReportsDisabledWrapper,
    });
    await waitForNextUpdate();

    expect(result.current.navPages.map((page) => page.id)).not.toContain(
      'hr-tools-page',
    );
  });
});
