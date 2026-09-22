import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { NewStaffQuestionnaireCompletedQuery } from './NewStaffQuestionnaireCompleted.generated';
import { UserOptionQuery } from './UserPreference.generated';
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

// A New Staff user with a staff account, eligible for the NS Goal tools
const newStaffUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.NewStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.NewStaff,
  staffAccountId: 'staff-account-1',
};

const questionnaireSpy = jest.fn();

const Wrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery }>
      mocks={{ GetUser: { user: ineligibleUser } }}
      onCall={questionnaireSpy}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

const makeNewStaffWrapper = (
  newStaffQuestionnaire: NonNullable<
    NewStaffQuestionnaireCompletedQuery['newStaffQuestionnaire']
  > | null,
) => {
  const NewStaffWrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        UserOption: UserOptionQuery;
        NewStaffQuestionnaireCompleted: NewStaffQuestionnaireCompletedQuery;
      }>
        mocks={{
          GetUser: { user: newStaffUser },
          UserOption: {
            userOption: { key: 'user_type_verified', value: 'true' },
          },
          NewStaffQuestionnaireCompleted: { newStaffQuestionnaire },
        }}
        onCall={questionnaireSpy}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  return NewStaffWrapper;
};

const MpdGoalEligibleWrapper = ({ children }: { children: ReactElement }) => (
  <TestRouter>
    <GqlMockedProvider<{ GetUser: GetUserQuery; UserOption: UserOptionQuery }>
      mocks={{
        GetUser: { user: mpdGoalEligibleUser },
        UserOption: {
          userOption: { key: 'user_type_verified', value: 'true' },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

describe('useHrToolsNavItems', () => {
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_MPD_GOAL_ADMIN = 'false';
    process.env.DISABLE_NEW_REPORTS = 'false';
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'false';
    questionnaireSpy.mockClear();
  });

  describe('nsoMpdQuestionnaire item', () => {
    beforeEach(() => {
      mockSession({ developer: false });
    });

    it('shows the item while the questionnaire is incomplete', async () => {
      const { result, waitFor } = renderHook(() => useHrToolsNavItems(), {
        wrapper: makeNewStaffWrapper({
          id: 'questionnaire-1',
          completed: false,
        }),
      });

      await waitFor(() => {
        expect(questionnaireSpy).toHaveGraphqlOperation(
          'NewStaffQuestionnaireCompleted',
          { accountListId: 'account-list-1' },
        );
      });
      expect(result.current.items.map((item) => item.id)).toContain(
        'nsoMpdQuestionnaire',
      );
    });

    it('hides the item once the questionnaire is completed', async () => {
      const { result, waitFor } = renderHook(() => useHrToolsNavItems(), {
        wrapper: makeNewStaffWrapper({
          id: 'questionnaire-1',
          completed: true,
        }),
      });

      await waitFor(() => {
        expect(questionnaireSpy).toHaveGraphqlOperation(
          'NewStaffQuestionnaireCompleted',
        );
      });
      await waitFor(() => {
        const ids = result.current.items.map((item) => item.id);
        // The sibling goal calculator item stays visible
        expect(ids).toContain('nsGoalCalculator');
        expect(ids).not.toContain('nsoMpdQuestionnaire');
      });
    });

    it('shows the item when the user has no questionnaire yet', async () => {
      const { result, waitFor } = renderHook(() => useHrToolsNavItems(), {
        wrapper: makeNewStaffWrapper(null),
      });

      await waitFor(() => {
        expect(questionnaireSpy).toHaveGraphqlOperation(
          'NewStaffQuestionnaireCompleted',
        );
      });
      expect(result.current.items.map((item) => item.id)).toContain(
        'nsoMpdQuestionnaire',
      );
    });

    it('does not load the questionnaire for an ineligible user', async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useHrToolsNavItems(),
        { wrapper: Wrapper },
      );
      await waitForNextUpdate();

      expect(result.current.items.map((item) => item.id)).not.toContain(
        'nsoMpdQuestionnaire',
      );
      expect(questionnaireSpy).not.toHaveGraphqlOperation(
        'NewStaffQuestionnaireCompleted',
      );
    });

    it('does not load the questionnaire when DISABLE_NS_GOAL_CALCULATOR is on', async () => {
      process.env.DISABLE_NS_GOAL_CALCULATOR = 'true';

      const { result, waitFor } = renderHook(() => useHrToolsNavItems(), {
        wrapper: makeNewStaffWrapper({
          id: 'questionnaire-1',
          completed: false,
        }),
      });

      await waitFor(() =>
        expect(result.current.items.map((item) => item.id)).toContain(
          'partnerReminders',
        ),
      );
      expect(result.current.items.map((item) => item.id)).not.toContain(
        'nsoMpdQuestionnaire',
      );
      expect(questionnaireSpy).not.toHaveGraphqlOperation(
        'NewStaffQuestionnaireCompleted',
      );
    });
  });

  it('hides all items, except partner reminders, for an ineligible user when not in a development env', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('partnerReminders');
  });

  it('hides every eligible item except partner reminders when DISABLE_NEW_REPORTS is on', async () => {
    process.env.DISABLE_NEW_REPORTS = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: MpdGoalEligibleWrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items.map((item) => item.id)).toEqual([
      'partnerReminders',
    ]);
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

  it('hides all items, except partner reminders, for an ineligible non-developer in a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('partnerReminders');
  });

  it('hides all items, except partner reminders, for an ineligible developer outside a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: true });

    const { result, waitForNextUpdate } = renderHook(
      () => useHrToolsNavItems(),
      { wrapper: Wrapper },
    );
    await waitForNextUpdate();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('partnerReminders');
  });
});
