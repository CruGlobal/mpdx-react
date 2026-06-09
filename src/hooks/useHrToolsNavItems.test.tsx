import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { useHrToolsNavItems } from './useHrToolsNavItems';

const setDeveloper = (developer: boolean) => {
  (useSession as jest.MockedFn<typeof useSession>).mockReturnValue({
    data: { ...session, user: { ...session.user, developer } },
    status: 'authenticated',
    update: () => Promise.resolve(null),
  });
};

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
    setDeveloper(false);
  });

  it('hides all items for an ineligible user when not in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(0);
  });

  it('shows all items for an ineligible developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    setDeveloper(true);

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
    setDeveloper(false);

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(0);
  });
});
