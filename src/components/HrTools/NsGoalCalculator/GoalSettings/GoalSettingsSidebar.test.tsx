import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { GoalSettingsNavigationProvider } from './GoalSettingsNavigationContext';
import { GoalSettingsSidebar } from './GoalSettingsSidebar';

const push = jest.fn();
const onCollapse = jest.fn();

const returnUrl =
  '/accountLists/account-list-1/hrTools/mpdGoalAdmin?tab=scenario-goals';

const TestComponent: React.FC<{
  view?: string;
  isScenario?: boolean;
  withReturnUrl?: boolean;
}> = ({ view, isScenario, withReturnUrl }) => (
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
      <GoalSettingsNavigationProvider
        returnUrl={withReturnUrl ? returnUrl : undefined}
      >
        <GoalSettingsSidebar isScenario={isScenario} onCollapse={onCollapse} />
      </GoalSettingsNavigationProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('GoalSettingsSidebar', () => {
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

  it('calls onCollapse when the collapse button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Collapse navigation' }));

    await waitFor(() => expect(onCollapse).toHaveBeenCalledTimes(1));
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

  describe('Back to Table', () => {
    it('returns to the table it was opened from', async () => {
      const { getByRole } = render(<TestComponent withReturnUrl />);

      userEvent.click(getByRole('button', { name: 'Back to Table' }));

      await waitFor(() => expect(push).toHaveBeenCalledWith(returnUrl));
    });

    it('is omitted when the goal was not opened from a table', () => {
      const { queryByRole } = render(<TestComponent />);

      expect(
        queryByRole('button', { name: 'Back to Table' }),
      ).not.toBeInTheDocument();
    });
  });
});
