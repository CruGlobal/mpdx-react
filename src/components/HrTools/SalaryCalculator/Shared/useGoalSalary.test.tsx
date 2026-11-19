import { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationPerson,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { GoalSalaryQuery } from './GoalSalary.generated';
import {
  GoalMock,
  currentYear,
  goalSalaryCalculations,
  makeGoal,
} from './goalSalaryMock';
import { useGoalSalary } from './useGoalSalary';

const calculations = goalSalaryCalculations;

type HcmPerson = Parameters<typeof useGoalSalary>[0];

const hcmUser = { staffInfo: { firstName: 'John' } };
const hcmSpouse = { staffInfo: { firstName: 'Jane' } };

const renderGoalSalary = (
  goals: GoalMock[],
  { spouse = hcmSpouse as HcmPerson | null, user = hcmUser as HcmPerson } = {},
) => {
  const wrapper = ({ children }: { children: ReactElement }) => (
    <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
      <GqlMockedProvider<{ GoalSalary: GoalSalaryQuery }>
        mocks={{
          GoalSalary: {
            goalCalculations: {
              nodes: goals,
              pageInfo: { hasNextPage: false },
            },
          },
        }}
      >
        {children}
      </GqlMockedProvider>
    </TestRouter>
  );
  return renderHook(() => useGoalSalary(user, spouse), { wrapper });
};

const waitForLoad = async (
  result: ReturnType<typeof renderGoalSalary>['result'],
) => await waitFor(() => expect(result.current.loading).toBe(false));

describe('useGoalSalary', () => {
  it("converts each person's share of the goal's gross salary to a requested salary", async () => {
    const { result } = renderGoalSalary([makeGoal('1')]);
    await waitForLoad(result);

    expect(result.current.goal?.name).toBe('Goal 1');
    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 36000,
      spouseSalary: 18000,
    });
  });

  it('uses the primary goal even when another goal is newer', async () => {
    const { result } = renderGoalSalary([
      makeGoal('newer', { updatedAt: '2020-01-02T00:00:00Z' }),
      makeGoal('primary', { primary: true }),
    ]);
    await waitForLoad(result);

    expect(result.current.goal?.id).toBe('primary');
  });

  it('uses the most recently updated goal when none is primary', async () => {
    const { result } = renderGoalSalary([
      makeGoal('older'),
      makeGoal('newer', { updatedAt: '2020-01-02T00:00:00Z' }),
    ]);
    await waitForLoad(result);

    expect(result.current.goal?.id).toBe('newer');
  });

  it('ignores goals from other calculation years and read-only goals', async () => {
    const { result } = renderGoalSalary([
      makeGoal('last-year', {
        primary: true,
        calculationsYear: currentYear - 1,
      }),
      makeGoal('converted', { readOnly: true }),
    ]);
    await waitForLoad(result);

    expect(result.current.goal).toBeUndefined();
    expect(
      result.current.getGoalSalaries(calculations, calculations),
    ).toBeNull();
  });

  it('swaps the salaries when the spouse made the goal', async () => {
    const { result } = renderGoalSalary([
      makeGoal('1', { firstName: 'Jane', spouseFirstName: 'John' }),
    ]);
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 18000,
      spouseSalary: 36000,
    });
  });

  it('matches preferred names, ignoring case and spaces', async () => {
    const { result } = renderGoalSalary(
      [makeGoal('1', { firstName: ' janie ', spouseFirstName: 'Johnny' })],
      {
        user: { staffInfo: { firstName: 'John', preferredName: 'Johnny' } },
        spouse: { staffInfo: { firstName: 'Jane', preferredName: 'Janie' } },
      },
    );
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 18000,
      spouseSalary: 36000,
    });
  });

  it("uses the spouse's share when the spouse made the goal and the form has no spouse", async () => {
    const { result } = renderGoalSalary(
      [makeGoal('1', { firstName: 'Jane', spouseFirstName: 'John' })],
      { spouse: null },
    );
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, null)).toEqual({
      salary: 18000,
      spouseSalary: null,
    });
  });

  it("returns null when the goal's names don't say who is who", async () => {
    const { result } = renderGoalSalary([
      makeGoal('1', { firstName: 'Bob', spouseFirstName: 'Sue' }),
    ]);
    await waitForLoad(result);

    expect(
      result.current.getGoalSalaries(calculations, calculations),
    ).toBeNull();
  });

  it("swaps the salaries when the goal's person numbers say the spouse made it", async () => {
    const { result } = renderGoalSalary([
      makeGoal('1', {
        firstName: 'Bob',
        spouseFirstName: 'Sue',
        currentUserPerson: GoalCalculationPerson.Spouse,
      }),
    ]);
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 18000,
      spouseSalary: 36000,
    });
  });

  it("trusts the goal's person numbers over its names", async () => {
    const { result } = renderGoalSalary([
      makeGoal('1', {
        firstName: 'Jane',
        spouseFirstName: 'John',
        currentUserPerson: GoalCalculationPerson.User,
      }),
    ]);
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 36000,
      spouseSalary: 18000,
    });
  });

  it('gives a single goal to the staff member whatever its name', async () => {
    const { result } = renderGoalSalary(
      [
        makeGoal('1', {
          firstName: 'Bob',
          familySize: MpdGoalBenefitsConstantSizeEnum.Single,
        }),
      ],
      { spouse: null },
    );
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, null)).toEqual({
      salary: 36000,
      spouseSalary: null,
    });
  });

  it('leaves out the spouse when the form has no spouse', async () => {
    const { result } = renderGoalSalary([makeGoal('1')], { spouse: null });
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, null)).toEqual({
      salary: 36000,
      spouseSalary: null,
    });
  });

  it('returns null for a goal with no salary', async () => {
    const { result } = renderGoalSalary([
      makeGoal('1', { netPaycheckAmount: 0, spouseNetPaycheckAmount: 0 }),
    ]);
    await waitForLoad(result);

    expect(
      result.current.getGoalSalaries(calculations, calculations),
    ).toBeNull();
  });
});
