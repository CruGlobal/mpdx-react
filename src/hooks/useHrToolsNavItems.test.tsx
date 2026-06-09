import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { useHrToolsNavItems } from './useHrToolsNavItems';

// A user in a group that is ineligible for every HR Tool and with no staff account
const ineligibleUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.PartTimeFieldStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.PartTimeFieldStaff,
  staffAccountId: null,
};

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GetUser: GetUserQuery }>
    mocks={{ GetUser: { user: ineligibleUser } }}
  >
    {children}
  </GqlMockedProvider>
);

describe('useHrToolsNavItems', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession();
  });

  it('hides all items for an ineligible user when not in a development env', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(0);
  });

  it('shows all items for an ineligible developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items.map((item) => item.id)).toEqual([
      'salaryCalculator',
      'staffSavingFund',
      'nsGoalCalculator',
      'goalCalculator',
      'mhaCalculator',
      'additionalSalaryRequest',
      'pdsGoalCalculator',
      'partnerReminders',
    ]);
  });

  it('hides all items for an ineligible non-developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(0);
  });

  it('hides all items for an ineligible developer outside a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(0);
  });
});
