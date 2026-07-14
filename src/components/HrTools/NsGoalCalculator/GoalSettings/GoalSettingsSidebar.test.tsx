import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { GoalSettingsSidebar } from './GoalSettingsSidebar';

const push = jest.fn();

const TestComponent: React.FC<{ view?: string; isScenario?: boolean }> = ({
  view,
  isScenario,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        pathname:
          '/accountLists/[accountListId]/coaching/[coachingId]/nsGoalCalculator',
        query: {
          accountListId: 'account-list-1',
          coachingId: 'coaching-1',
          view,
        },
        push,
      }}
    >
      <GoalSettingsSidebar isScenario={isScenario} />
    </TestRouter>
  </ThemeProvider>
);

describe('GoalSettingsSidebar', () => {
  beforeEach(() => push.mockClear());

  it('renders the top-level nav entries with staff sub-items expanded by default', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: /Goal Settings/ })).toBeInTheDocument();
    expect(
      getByRole('button', { name: /Staff Documents/ }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Review Your Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });

  it('omits Presenting Your Goal for scenario goals', () => {
    const { getByRole, queryByRole } = render(<TestComponent isScenario />);

    expect(
      getByRole('button', { name: 'Review Your Goal' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Presenting Your Goal' }),
    ).not.toBeInTheDocument();
  });

  it('marks the active view with aria-current', () => {
    const { getByRole } = render(<TestComponent view="present-your-goal" />);

    expect(
      getByRole('button', { name: 'Presenting Your Goal' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(getByRole('button', { name: /Goal Settings/ })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('pushes the Review Your Goal view when its item is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Review Your Goal' }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        {
          pathname:
            '/accountLists/[accountListId]/coaching/[coachingId]/nsGoalCalculator',
          query: {
            accountListId: 'account-list-1',
            coachingId: 'coaching-1',
            view: 'review-your-goal',
          },
        },
        undefined,
        { shallow: true },
      ),
    );
  });
});
