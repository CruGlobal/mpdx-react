import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonatorRole } from 'src/lib/impersonationAccess';
import { UserOptionQuery } from './UserPreference.generated';
import { useReportNavItems } from './useReportNavItems';

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
    // mockSession uses mockReturnValue, which clearMocks does not reset
    mockSession({});
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it('hides gated items for a non-developer when not in a development env', async () => {
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
    mockSession({ developer: false });

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
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.map((item) => item.id)).toContain(
      'financialAccounts',
    );
  });

  it('does not bypass gating for a developer outside a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.map((item) => item.id)).not.toContain(
      'financialAccounts',
    );
  });

  it('hides staff reports for a hybrid user with no staff account', async () => {
    const HybridNoStaffAccountWrapper = ({
      children,
    }: {
      children: ReactElement;
    }) => (
      <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
        mocks={{
          GetUser: {
            user: {
              userType: UserTypeEnum.HybridStaff,
              staffAccountId: null,
            },
          },
          UserOption: {
            userOption: { key: 'user_type_verified', value: 'true' },
          },
        }}
      >
        {children}
      </GqlMockedProvider>
    );

    const { result, waitForNextUpdate } = renderHook(
      () => useReportNavItems(),
      { wrapper: HybridNoStaffAccountWrapper },
    );
    await waitForNextUpdate();

    const ids = result.current.map((item) => item.id);
    expect(ids).not.toContain('staffExpense');
    expect(ids).not.toContain('mpgaIncomeExpenses');

    expect(ids).toContain('financialAccounts');
  });

  describe('expense reports while impersonating', () => {
    const renderItemIds = async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useReportNavItems(),
        { wrapper: Wrapper },
      );
      await waitForNextUpdate();
      return result.current.map((item) => item.id);
    };

    it.each([
      ImpersonatorRole.HelpdeskAdmin,
      ImpersonatorRole.MpdLeader,
      ImpersonatorRole.HrLeader,
    ])(
      'hides the Staff Expense Report and Income/Expense Analysis from a %s impersonator',
      async (impersonatorRole) => {
        mockSession({ impersonating: true, impersonatorRole });

        const ids = await renderItemIds();

        expect(ids).not.toContain('staffExpense');
        expect(ids).not.toContain('mpgaIncomeExpenses');
        // Other reports are untouched
        expect(ids).toContain('donations');
      },
    );

    it('shows the expense reports to a developer impersonator', async () => {
      mockSession({
        impersonating: true,
        impersonatorRole: ImpersonatorRole.Developer,
      });

      const ids = await renderItemIds();

      expect(ids).toContain('staffExpense');
      expect(ids).toContain('mpgaIncomeExpenses');
    });

    it('shows the expense reports when not impersonating', async () => {
      mockSession({ impersonating: false });

      const ids = await renderItemIds();

      expect(ids).toContain('staffExpense');
      expect(ids).toContain('mpgaIncomeExpenses');
    });

    it('keeps the expense reports hidden from a non-developer impersonator even with the developer bypass', async () => {
      process.env.DEVELOPMENT_ENV = 'true';
      mockSession({
        developer: true,
        impersonating: true,
        impersonatorRole: ImpersonatorRole.HelpdeskAdmin,
      });

      const ids = await renderItemIds();

      // The bypass still shows the other gated items
      expect(ids).toContain('financialAccounts');
      expect(ids).not.toContain('staffExpense');
      expect(ids).not.toContain('mpgaIncomeExpenses');
    });
  });
});
