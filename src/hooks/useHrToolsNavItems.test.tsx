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

// A Senior Staff user with a staff account, eligible for the MPD Goal tools
const mpdGoalEligibleUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.SeniorStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.SeniorStaff,
  staffAccountId: 'staff-account-1',
};

const Wrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GetUser: GetUserQuery }>
    mocks={{ GetUser: { user: ineligibleUser } }}
  >
    {children}
  </GqlMockedProvider>
);

const MpdGoalEligibleWrapper = ({ children }: { children: ReactElement }) => (
  <GqlMockedProvider<{ GetUser: GetUserQuery }>
    mocks={{ GetUser: { user: mpdGoalEligibleUser } }}
  >
    {children}
  </GqlMockedProvider>
);

describe('useHrToolsNavItems', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_MPD_GOAL_ADMIN = 'false';
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
      'nsoMpdQuestionnaire',
      'goalCalculator',
      'mpdGoalAdmin',
      'mhaCalculator',
      'additionalSalaryRequest',
      'pdsGoalCalculator',
      'partnerReminders',
      'mpdSupervisorReport',
    ]);
  });

  it('hides the mpdGoalAdmin item when DISABLE_MPD_GOAL_ADMIN is on', async () => {
    process.env.DISABLE_MPD_GOAL_ADMIN = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: MpdGoalEligibleWrapper },
    );
    await waitForNextUpdate();

    const ids = result.current.items.map((item) => item.id);
    // The flag hides mpdGoalAdmin even though the user is otherwise eligible
    expect(ids).not.toContain('mpdGoalAdmin');
    // The sibling goalCalculator item (same eligibility, no flag) stays visible
    expect(ids).toContain('goalCalculator');
  });

  it('shows the mpdGoalAdmin item for an eligible user when DISABLE_MPD_GOAL_ADMIN is off', async () => {
    process.env.DISABLE_MPD_GOAL_ADMIN = 'false';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: MpdGoalEligibleWrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items.map((item) => item.id)).toContain(
      'mpdGoalAdmin',
    );
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
