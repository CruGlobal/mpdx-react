import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useReportNavItems } from './useReportNavItems';

const setDeveloper = (developer: boolean) => {
  (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
    data: { ...session, user: { ...session.user, developer } },
    status: 'authenticated',
    update: () => Promise.resolve(null),
  });
};

// financialAccounts is gated to global staff, so it is hidden for this user unless a developer
// bypasses gating
const user = {
  userType: UserTypeEnum.UsStaff,
  staffAccountId: 'staff-1',
};

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
    mocks={{
      GetUser: { user },
      // user_type_verified === 'true' keeps reports enabled
      UserOption: { userOption: { key: 'user_type_verified', value: 'true' } },
    }}
  >
    {children}
  </GqlMockedProvider>
);

describe('useReportNavItems', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    setDeveloper(false);
  });

  it('hides gated items for a non-developer when not in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.map((item) => item.id)).not.toContain(
      'financialAccounts',
    );
  });

  it('does not bypass gating for a non-developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    setDeveloper(false);

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.map((item) => item.id)).not.toContain(
      'financialAccounts',
    );
  });

  it('shows gated items for a developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    setDeveloper(true);

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.map((item) => item.id)).toContain(
      'financialAccounts',
    );
  });
});
