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
import { missingValue } from '../../Shared/helpers/missingValue';
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

const failingConstants = (() => {
  throw new Error('Could not load the constants');
}) as unknown as GoalCalculatorConstantsQuery['constant'];

interface TestComponentProps {
  goals?: ListGoalCalculationFragment[];
  currentMonthlyGoal?: number | null;
  constants?: GoalCalculatorConstantsQuery['constant'];
}

const TestComponent: React.FC<TestComponentProps> = ({
  goals,
  currentMonthlyGoal = 6000,
  constants = constantsMock,
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
          GoalCalculatorConstants: { constant: constants },
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

    const calculatedGoalCard = utils.getByRole('region', {
      name: 'Calculated Monthly Goal',
    });
    expect(calculatedGoalCard).not.toHaveTextContent('$');
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

  it('shows the newest primary goal when there are two', async () => {
    const withPrimaries = goals.map((goal) => ({
      ...goal,
      primary: goal.id !== 'goal-1',
    }));
    const utils = render(<TestComponent goals={withPrimaries} />);

    expect(await findCalculatedGoalCard(utils)).toHaveTextContent(
      'From your goal: Annual Giving Goal',
    );
  });

  it('skips read-only goals', async () => {
    const withReadOnly = [
      makeGoal('goal-0', 'New Staff Goal', { readOnly: true, primary: true }),
      ...goals,
    ];
    const utils = render(<TestComponent goals={withReadOnly} />);

    expect(await findCalculatedGoalCard(utils)).toHaveTextContent(
      'From your goal: Monthly Support Goal',
    );
  });

  it('shows only the monthly goal when every goal is read-only', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent goals={[makeGoal('goal-0', null, { readOnly: true })]} />,
    );

    expect(
      await findByRole('region', { name: 'Current Monthly Goal' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('region', { name: 'Calculated Monthly Goal' }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['fail to load', failingConstants],
    [
      'are not set up for the year',
      { ...constantsMock, mpdGoalBenefitsConstants: [] },
    ],
  ])('shows a dash when the constants %s', async (_, constants) => {
    const utils = render(<TestComponent goals={goals} constants={constants} />);

    const calculatedGoalCard = await findCalculatedGoalCard(utils);
    expect(
      await within(calculatedGoalCard).findByText(missingValue),
    ).toBeVisible();
  });

  it('names an unnamed goal', async () => {
    const utils = render(<TestComponent goals={[makeGoal('goal-1', null)]} />);

    expect(await findCalculatedGoalCard(utils)).toHaveTextContent(
      'From your goal: Unnamed Goal',
    );
  });

  it('stacks the cards on phone widths only', async () => {
    const utils = render(<TestComponent goals={goals} />);

    await findCalculatedGoalCard(utils);
    const cardRow = utils.getByTestId('GoalSummaryCards');
    expect(getStyleAtWidth(cardRow, 'flex-direction', phoneWidth)).toBe(
      'column',
    );
    expect(getStyleAtWidth(cardRow, 'flex-direction', desktopWidth)).toBe(
      'row',
    );
  });
});
