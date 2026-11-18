import { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdGoalBenefitsConstantSizeEnum } from 'src/graphql/types.generated';
import { goalCalculationMock } from '../../GoalCalculator/GoalCalculatorTestWrapper';
import { GoalSalaryQuery } from './GoalSalary.generated';
import { useGoalSalary } from './useGoalSalary';

type GoalMock = GoalSalaryQuery['goalCalculations']['nodes'][number];

// Jest pins the current date to 2020-01-01
const currentYear = 2020;

// $2,000 + $1,000 net paychecks with no taxes, 403(b) or outside income is a
// $72,000 gross annual salary, split $48,000 and $24,000
const makeGoal = (id: string, overrides: Partial<GoalMock> = {}): GoalMock => ({
  ...goalCalculationMock,
  id,
  name: `Goal ${id}`,
  primary: false,
  readOnly: false,
  calculationsYear: currentYear,
  updatedAt: '2020-01-01T00:00:00Z',
  firstName: 'John',
  familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
  netPaycheckAmount: 2000,
  spouseNetPaycheckAmount: 1000,
  taxesPercentage: 0,
  spouseTaxesPercentage: 0,
  rothContributionPercentage: 0,
  spouseRothContributionPercentage: 0,
  traditionalContributionPercentage: 0,
  spouseTraditionalContributionPercentage: 0,
  householdFamily: {
    ...goalCalculationMock.householdFamily,
    directInput: null,
  },
  specialFamily: {
    ...goalCalculationMock.specialFamily,
    primaryBudgetCategories: [],
  },
  ...overrides,
});

// Requested salary = gross * 0.9 / 1.2
const calculations = { non403bFraction: 0.9, secaEstimatedFraction: 0.2 };

const hcmUser = { staffInfo: { firstName: 'John' } };
const hcmSpouse = { staffInfo: { firstName: 'Jane' } };

const renderGoalSalary = (
  goals: GoalMock[],
  { spouse = hcmSpouse as typeof hcmSpouse | null, user = hcmUser } = {},
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
    const { result } = renderGoalSalary([makeGoal('1', { firstName: 'Jane' })]);
    await waitForLoad(result);

    expect(result.current.getGoalSalaries(calculations, calculations)).toEqual({
      salary: 18000,
      spouseSalary: 36000,
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
