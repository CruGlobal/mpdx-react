import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { NsGoalCalculatorLink } from './NsGoalCalculatorLink';
import { NewStaffGoalExistsQuery } from './NsGoalCalculatorLink.generated';

interface TestComponentProps {
  goalExists?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ goalExists = true }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ NewStaffGoalExists: NewStaffGoalExistsQuery }>
        mocks={{
          NewStaffGoalExists: {
            newStaffGoalCalculation: goalExists
              ? { id: 'goal-calculation-1' }
              : null,
          },
        }}
      >
        <NsGoalCalculatorLink coachingId="coaching-account-1" />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('NsGoalCalculatorLink', () => {
  const originalFlag = process.env.DISABLE_NS_GOAL_CALCULATOR;

  afterEach(() => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = originalFlag;
  });

  it("links to the coachee's goal calculator when a goal exists", async () => {
    const { findByRole } = render(<TestComponent />);

    const link = await findByRole('link', { name: 'View New Staff Goal' });
    expect(link).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/coaching/coaching-account-1/nsGoalCalculator',
    );
  });

  it('renders nothing when no goal exists for the coachee', async () => {
    const { container, queryByRole } = render(
      <TestComponent goalExists={false} />,
    );

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(
      queryByRole('link', { name: 'View New Staff Goal' }),
    ).not.toBeInTheDocument();
  });

  it('renders nothing when DISABLE_NS_GOAL_CALCULATOR is set', () => {
    process.env.DISABLE_NS_GOAL_CALCULATOR = 'true';

    const { container } = render(<TestComponent />);

    expect(container).toBeEmptyDOMElement();
  });
});
