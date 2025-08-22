import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from 'src/theme';
import { GoalCalculator } from './GoalCalculator';
import { GoalCalculatorStepEnum } from './GoalCalculatorHelper';
import { GoalCalculatorTestWrapper } from './GoalCalculatorTestWrapper';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';

interface ContextHelperProps {
  selectedStepId: GoalCalculatorStepEnum;
}

/**
 * This component is only for use in tests. It makes it simpler to open a specific step within
 * tests. It also extracts state from the context, like the right panel contents, and renders it
 * in the page so that tests can query and assert the state of the context.
 */
const ContextHelper: React.FC<ContextHelperProps> = ({ selectedStepId }) => {
  const { handleStepChange, rightPanelContent } = useGoalCalculator();

  useEffect(() => {
    handleStepChange(selectedStepId);
  }, []);

  return <aside aria-label="Right Panel">{rightPanelContent}</aside>;
};

interface TestComponentProps {
  selectedStepId?: GoalCalculatorStepEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  selectedStepId = GoalCalculatorStepEnum.MinistryExpenses,
}) => (
  <ThemeProvider theme={theme}>
    <GoalCalculatorTestWrapper>
      <ContextHelper selectedStepId={selectedStepId} />
      <GoalCalculator />
    </GoalCalculatorTestWrapper>
  </ThemeProvider>
);

describe('GoalCalculator', () => {
  it('renders the step title and instructions', () => {
    const { getByRole } = render(
      <TestComponent
        selectedStepId={GoalCalculatorStepEnum.HouseholdExpenses}
      />,
    );

    expect(
      getByRole('heading', { name: 'Household Expenses' }),
    ).toBeInTheDocument();

    expect(
      getByRole('heading', { name: 'Enter your monthly budget' }),
    ).toBeInTheDocument();
  });

  it('renders right panel components', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);
    const heading = await findByRole('heading', {
      name: 'Ministry & Medical Mileage',
    });
    userEvent.click(
      within(heading).getByRole('button', {
        name: 'Show additional info',
      }),
    );

    expect(
      getByRole('complementary', { name: 'Right Panel' }),
    ).toHaveTextContent('Mileage Expenses');
  });

  it('does not show info icon for categories without right panel content', async () => {
    const { findByRole } = render(<TestComponent />);
    const heading = await findByRole('heading', { name: 'Account Transfers' });
    expect(within(heading).queryByRole('button')).not.toBeInTheDocument();
  });

  describe('reports step', () => {
    it('renders custom section list and main content', () => {
      const { getByRole } = render(
        <TestComponent selectedStepId={GoalCalculatorStepEnum.SummaryReport} />,
      );

      expect(getByRole('button', { name: 'MPD Goal' })).toBeInTheDocument();
      expect(getByRole('heading', { name: 'MPD Goal' })).toBeInTheDocument();
    });
  });
});
