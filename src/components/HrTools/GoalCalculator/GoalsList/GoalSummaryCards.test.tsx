import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { CurrentMonthlyGoalQuery } from '../CalculatorSettings/GoalReferenceCards/CurrentMonthlyGoal.generated';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import { ListGoalCalculationFragment } from './GoalCalculations.generated';
import { GoalSummaryCards } from './GoalSummaryCards';

// Totals with constantsMock: $16,138.94 for the newest goal and $16,058.35 for
// the two with no paychecks
const makeGoal = (
  id: string,
  name: string | null,
  overrides: Partial<ListGoalCalculationFragment> = {},
): ListGoalCalculationFragment => ({
  ...goalCalculationMock,
  id,
  name,
  primary: false,
  ...overrides,
});
const noPaychecks = { netPaycheckAmount: 0, spouseNetPaycheckAmount: 0 };

// GoalSummaryCards receives the goals sorted newest first
const goals = [
  makeGoal('goal-1', 'Monthly Support Goal'),
  makeGoal('goal-2', 'Annual Giving Goal', noPaychecks),
  makeGoal('goal-3', 'Partnership Goal', noPaychecks),
];

interface TestComponentProps {
  goals?: ListGoalCalculationFragment[];
  currentMonthlyGoal?: number | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  goals,
  currentMonthlyGoal = 6000,
}) => (
  <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        CurrentMonthlyGoal: CurrentMonthlyGoalQuery;
        GoalCalculatorConstants: GoalCalculatorConstantsQuery;
      }>
        mocks={{
          CurrentMonthlyGoal: {
            accountList: { settings: { monthlyGoal: currentMonthlyGoal } },
          },
          GoalCalculatorConstants: { constant: constantsMock },
        }}
      >
        <GoalSummaryCards goals={goals} />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

const findCalculatedGoalCard = (utils: ReturnType<typeof render>) =>
  utils.findByRole('region', { name: 'Calculated Monthly Goal' });

describe('GoalSummaryCards', () => {
  it('shows the monthly goal from MPDX settings when there are no goals', async () => {
    const { findByRole, queryByRole } = render(<TestComponent goals={[]} />);

    const currentGoalCard = await findByRole('region', {
      name: 'Current Monthly Goal',
    });
    expect(await within(currentGoalCard).findByText('$6,000')).toBeVisible();
    expect(currentGoalCard).toHaveTextContent('From your MPDX settings');
    expect(
      queryByRole('region', { name: 'Calculated Monthly Goal' }),
    ).not.toBeInTheDocument();
  });

  it('shows only the monthly goal while the goals load', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    expect(
      await findByRole('region', { name: 'Current Monthly Goal' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('region', { name: 'Calculated Monthly Goal' }),
    ).not.toBeInTheDocument();
  });

  it.each([null, 0])(
    'says the monthly goal is not set when it is %s',
    async (currentMonthlyGoal) => {
      const { findByRole } = render(
        <TestComponent goals={[]} currentMonthlyGoal={currentMonthlyGoal} />,
      );

      const currentGoalCard = await findByRole('region', {
        name: 'Current Monthly Goal',
      });
      expect(await within(currentGoalCard).findByText('Not set')).toBeVisible();
    },
  );

  it('shows the newest goal next to the monthly goal', async () => {
    const utils = render(<TestComponent goals={goals} />);

    const calculatedGoalCard = await findCalculatedGoalCard(utils);
    expect(
      await within(calculatedGoalCard).findByText('$16,139'),
    ).toBeVisible();
    expect(calculatedGoalCard).toHaveTextContent(
      'From your goal: Monthly Support Goal',
    );
    expect(
      utils.getByRole('region', { name: 'Current Monthly Goal' }),
    ).toBeInTheDocument();
  });

  it('shows the primary goal even when another goal is newer', async () => {
    const withPrimary = goals.map((goal) => ({
      ...goal,
      primary: goal.id === 'goal-3',
    }));
    const utils = render(<TestComponent goals={withPrimary} />);

    const calculatedGoalCard = await findCalculatedGoalCard(utils);
    expect(
      await within(calculatedGoalCard).findByText('$16,058'),
    ).toBeVisible();
    expect(calculatedGoalCard).toHaveTextContent(
      'From your goal: Partnership Goal',
    );
  });

  it('names an unnamed goal', async () => {
    const utils = render(<TestComponent goals={[makeGoal('goal-1', null)]} />);

    expect(await findCalculatedGoalCard(utils)).toHaveTextContent(
      'From your goal: Unnamed Goal',
    );
  });

  it('stacks the cards on phone widths only', async () => {
    const utils = render(<TestComponent goals={goals} />);

    const cardRow = (await findCalculatedGoalCard(utils)).parentElement;
    if (!cardRow) {
      throw new Error('The card has no parent element');
    }
    expect(getStyleAtWidth(cardRow, 'flex-direction', phoneWidth)).toBe(
      'column',
    );
    expect(getStyleAtWidth(cardRow, 'flex-direction', desktopWidth)).toBe(
      'row',
    );
  });
});
