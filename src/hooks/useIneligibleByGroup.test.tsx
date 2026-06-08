import { ReactElement } from 'react';
import { waitFor } from '@testing-library/dom';
import { renderHook } from '@testing-library/react-hooks';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import { useIneligibleByGroup } from './useIneligibleByGroup';

interface MockUser {
  usStaffGroup?: UsStaffGroupEnum | null;
  userType?: UserTypeEnum;
  staffAccountId?: string | null;
  spouseUsStaffGroup?: UsStaffGroupEnum | null;
}

const renderUseIneligibleByGroup = (user: MockUser = {}) =>
  renderHook(() => useIneligibleByGroup(), {
    wrapper: ({ children }: { children: ReactElement }) => (
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={{
          GetUser: {
            user: {
              userType: UserTypeEnum.UsStaff,
              staffAccountId: 'staff-account-1',
              ...user,
            },
          },
        }}
      >
        {children}
      </GqlMockedProvider>
    ),
  });

describe('useIneligibleByGroup', () => {
  it('reports loading before the user query resolves', () => {
    const { result } = renderUseIneligibleByGroup();

    expect(result.current.userLoading).toBe(true);
    expect(result.current.userError).toBeUndefined();
  });

  it('surfaces a query error', async () => {
    const { result } = renderHook(() => useIneligibleByGroup(), {
      wrapper: ({ children }: { children: ReactElement }) => (
        <GqlMockedProvider
          mocks={{
            GetUser: {
              user: () => {
                throw new Error('User fetch failed');
              },
            },
          }}
        >
          {children}
        </GqlMockedProvider>
      ),
    });

    await waitFor(() => expect(result.current.userError).toBeDefined());
    expect(result.current.userLoading).toBe(false);
  });

  it('passes through userType and hasNoStaffAccount', async () => {
    const { result } = renderUseIneligibleByGroup({
      userType: UserTypeEnum.UsStaff,
      staffAccountId: null,
    });

    await waitFor(() => expect(result.current.userLoading).toBe(false));
    expect(result.current.userType).toBe(UserTypeEnum.UsStaff);
    expect(result.current.hasNoStaffAccount).toBe(true);
  });

  describe('ineligibility by staff group', () => {
    it('senior staff eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.SeniorStaff,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(false);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(false);
      expect(result.current.inMhaIneligibleGroup).toBe(false);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(false);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });

    it('new staff eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.NewStaff,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(false);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
      expect(result.current.inMhaIneligibleGroup).toBe(true);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });

    it('part time field staff eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.PartTimeFieldStaff,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(true);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
      expect(result.current.inMhaIneligibleGroup).toBe(true);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });

    it('paid with designation eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.PaidWithDesignation,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(true);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
      expect(result.current.inMhaIneligibleGroup).toBe(true);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(false);
    });

    it('intern eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.Intern,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(true);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
      expect(result.current.inMhaIneligibleGroup).toBe(true);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });

    it('national expat eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: UsStaffGroupEnum.NationalExpat,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(false);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(false);
      expect(result.current.inMhaIneligibleGroup).toBe(false);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });

    describe('spouse us staff group', () => {
      it('user is null and spouse is senior staff', async () => {
        const { result } = renderUseIneligibleByGroup({
          usStaffGroup: null,
          spouseUsStaffGroup: UsStaffGroupEnum.SeniorStaff,
        });

        await waitFor(() => expect(result.current.userLoading).toBe(false));
        expect(result.current.inAsrIneligibleGroup).toBe(false);
        expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
        expect(result.current.inMhaIneligibleGroup).toBe(false);
        expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
        expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
      });
    });

    it('no us staff group eligibility', async () => {
      const { result } = renderUseIneligibleByGroup({
        usStaffGroup: null,
        spouseUsStaffGroup: null,
      });

      await waitFor(() => expect(result.current.userLoading).toBe(false));
      expect(result.current.inAsrIneligibleGroup).toBe(true);
      expect(result.current.inSalaryCalcIneligibleGroup).toBe(true);
      expect(result.current.inMhaIneligibleGroup).toBe(true);
      expect(result.current.inMpdGoalCalcIneligibleGroup).toBe(true);
      expect(result.current.inPdsGoalCalcIneligibleGroup).toBe(true);
    });
  });
});
