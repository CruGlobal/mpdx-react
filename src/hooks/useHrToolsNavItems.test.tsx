import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { DeepPartial } from 'ts-essentials';
import { session } from '__tests__/fixtures/session';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { ImpersonatorRole } from 'src/lib/impersonationAccess';
import { NewStaffQuestionnaireStatusQuery } from './NewStaffQuestionnaireStatus.generated';
import { UserOptionQuery } from './UserPreference.generated';
import { useHrToolsNavItems } from './useHrToolsNavItems';

// A user in a group that is ineligible for every HR Tool and with no staff account
const ineligibleUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.PartTimeFieldStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.PartTimeFieldStaff,
  staffAccountId: null,
  canViewNewStaffCohorts: false,
};

// A Senior Staff user with a staff account, eligible for the MPD Goal tools
const mpdGoalEligibleUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.SeniorStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.SeniorStaff,
  staffAccountId: 'staff-account-1',
  canViewNewStaffCohorts: true,
};

// A New Staff user, the only group offered the NSO MPD Questionnaire
const newStaffUser = {
  userType: UserTypeEnum.UsStaff,
  usStaffGroup: UsStaffGroupEnum.NewStaff,
  spouseUsStaffGroup: UsStaffGroupEnum.NewStaff,
  staffAccountId: 'staff-account-1',
  canViewNewStaffCohorts: false,
};

type Mocks = {
  GetUser: GetUserQuery;
  UserOption: UserOptionQuery;
  NewStaffQuestionnaireStatus: NewStaffQuestionnaireStatusQuery;
};

const verifiedUserOption = {
  userOption: { key: 'user_type_verified', value: 'true' },
};

const makeWrapper = (mocks: DeepPartial<Mocks>) => {
  const MocksWrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter>
      <GqlMockedProvider<Mocks> mocks={mocks}>{children}</GqlMockedProvider>
    </TestRouter>
  );
  return MocksWrapper;
};

const Wrapper = makeWrapper({ GetUser: { user: ineligibleUser } });

const MpdGoalEligibleWrapper = makeWrapper({
  GetUser: { user: mpdGoalEligibleUser },
  UserOption: verifiedUserOption,
});

// A user who supervises staff, eligible for the MPD Supervisor Report
const SupervisorEligibleWrapper = makeWrapper({
  GetUser: { user: { ...mpdGoalEligibleUser, supervisesStaff: true } },
  UserOption: verifiedUserOption,
});

describe('useHrToolsNavItems', () => {
  afterEach(() => {
    // mockSession uses mockReturnValue, which clearMocks does not reset
    mockSession({});
    process.env.DEVELOPMENT_ENV = 'false';
    process.env.DISABLE_MPD_GOAL_ADMIN = 'false';
    process.env.DISABLE_NEW_REPORTS = 'false';
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

  describe('while impersonating', () => {
    const allToolIds = [
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
    ];

    const renderItemIds = async (
      wrapper: ({ children }: { children: ReactElement }) => ReactElement,
    ) => {
      const { result, waitForNextUpdate } = renderHook(
        () => useHrToolsNavItems(),
        { wrapper },
      );
      await waitForNextUpdate();
      return result.current.items.map((item) => item.id);
    };

    // Every tool is otherwise visible, so only the impersonator role filters the list
    const renderWithBypass = (
      user: Partial<typeof session.user>,
    ): Promise<string[]> => {
      process.env.DEVELOPMENT_ENV = 'true';
      mockSession({ developer: true, impersonating: true, ...user });
      return renderItemIds(Wrapper);
    };

    it('shows every tool to a developer impersonator', async () => {
      expect(
        await renderWithBypass({
          impersonatorRole: ImpersonatorRole.Developer,
        }),
      ).toEqual(allToolIds);
    });

    it('shows the MPD tools, and nothing else, to an mpd_leader impersonator', async () => {
      expect(
        await renderWithBypass({
          impersonatorRole: ImpersonatorRole.MpdLeader,
        }),
      ).toEqual([
        'nsGoalCalculator',
        'nsoMpdQuestionnaire',
        'mpdGoalAdmin',
        'pdsGoalCalculator',
        'partnerReminders',
      ]);
    });

    it('shows the HR tools, and nothing else, to an hr_leader impersonator', async () => {
      expect(
        await renderWithBypass({ impersonatorRole: ImpersonatorRole.HrLeader }),
      ).toEqual([
        'salaryCalculator',
        'staffSavingFund',
        'mhaCalculator',
        'additionalSalaryRequest',
      ]);
    });

    it('shows no tools to a helpdesk_admin impersonator', async () => {
      expect(
        await renderWithBypass({
          impersonatorRole: ImpersonatorRole.HelpdeskAdmin,
        }),
      ).toEqual([]);
    });

    it('shows no tools to an impersonator with no known role', async () => {
      expect(await renderWithBypass({ impersonatorRole: undefined })).toEqual(
        [],
      );
    });

    it('shows every tool when not impersonating', async () => {
      expect(
        await renderWithBypass({
          impersonating: false,
          impersonatorRole: undefined,
        }),
      ).toEqual(allToolIds);
    });

    it('still applies eligibility on top of the role', async () => {
      mockSession({
        impersonating: true,
        impersonatorRole: ImpersonatorRole.MpdLeader,
      });

      const ids = await renderItemIds(SupervisorEligibleWrapper);

      // Allowed by role and eligible
      expect(ids).toContain('mpdGoalAdmin');
      expect(ids).toContain('partnerReminders');
      // Allowed by role but a Senior Staff user is not eligible
      expect(ids).not.toContain('nsGoalCalculator');
      // Eligible but not allowed by role
      expect(ids).not.toContain('goalCalculator');
      expect(ids).not.toContain('mpdSupervisorReport');
    });
  });

  describe('mpdGoalAdmin', () => {
    const renderWithUser = (user: typeof mpdGoalEligibleUser) =>
      renderHook(() => useHrToolsNavItems(), {
        wrapper: makeWrapper({
          GetUser: { user },
          UserOption: verifiedUserOption,
        }),
      });

    beforeEach(() => {
      mockSession({ developer: false });
    });

    it('is hidden from a Senior Staff user without goals-team or coordinator access', async () => {
      const { result, waitForNextUpdate } = renderWithUser({
        ...mpdGoalEligibleUser,
        canViewNewStaffCohorts: false,
      });
      await waitForNextUpdate();

      const ids = result.current.items.map((item) => item.id);
      expect(ids).not.toContain('mpdGoalAdmin');
      // The tools that really are group-gated are untouched
      expect(ids).toContain('goalCalculator');
    });

    it('is shown to a coordinator whose own group is ineligible for the MPD Goal tools', async () => {
      const { result, waitForNextUpdate } = renderWithUser({
        ...newStaffUser,
        canViewNewStaffCohorts: true,
      });
      await waitForNextUpdate();

      const ids = result.current.items.map((item) => item.id);
      expect(ids).toContain('mpdGoalAdmin');
      expect(ids).not.toContain('goalCalculator');
    });
  });

  describe('nsoMpdQuestionnaire', () => {
    const renderWithQuestionnaire = (
      newStaffQuestionnaire: NewStaffQuestionnaireStatusQuery['newStaffQuestionnaire'],
    ) =>
      renderHook(() => useHrToolsNavItems(), {
        wrapper: makeWrapper({
          GetUser: { user: newStaffUser },
          UserOption: verifiedUserOption,
          NewStaffQuestionnaireStatus: { newStaffQuestionnaire },
        }),
      });

    beforeEach(() => {
      mockSession({ developer: false });
    });

    it('is shown to new staff who still have one to fill in', async () => {
      const { result, waitForNextUpdate } = renderWithQuestionnaire({
        id: 'questionnaire-1',
        completed: false,
      });
      await waitForNextUpdate();

      expect(result.current.items.map((item) => item.id)).toContain(
        'nsoMpdQuestionnaire',
      );
    });

    it('is hidden once new staff have completed it', async () => {
      const { result, waitForNextUpdate } = renderWithQuestionnaire({
        id: 'questionnaire-1',
        completed: true,
      });
      await waitForNextUpdate();

      const ids = result.current.items.map((item) => item.id);
      expect(ids).not.toContain('nsoMpdQuestionnaire');
      // The sibling New Staff tool, gated only by group, stays visible
      expect(ids).toContain('nsGoalCalculator');
    });

    it('is hidden when new staff have no questionnaire at all', async () => {
      const { result, waitForNextUpdate } = renderWithQuestionnaire(null);
      await waitForNextUpdate();

      expect(result.current.items.map((item) => item.id)).not.toContain(
        'nsoMpdQuestionnaire',
      );
    });

    it('stays visible for new staff when the status query fails', async () => {
      const { result } = renderHook(() => useHrToolsNavItems(), {
        wrapper: makeWrapper({
          GetUser: { user: newStaffUser },
          UserOption: verifiedUserOption,
          NewStaffQuestionnaireStatus: {
            newStaffQuestionnaire: () => {
              throw new Error('Not authorized');
            },
          },
        } as unknown as DeepPartial<Mocks>),
      });

      await waitFor(() =>
        expect(result.current.items.map((item) => item.id)).toContain(
          'nsoMpdQuestionnaire',
        ),
      );
    });
  });
});
