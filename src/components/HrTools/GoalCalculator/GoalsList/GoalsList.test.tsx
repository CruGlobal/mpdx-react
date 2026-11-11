import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { CurrentMonthlyGoalQuery } from '../CalculatorSettings/GoalReferenceCards/CurrentMonthlyGoal.generated';
import { GoalCalculationsQuery } from './GoalCalculations.generated';
import { GoalsList } from './GoalsList';

const mutationSpy = jest.fn();

// The button row and the card info rows have no role, so they are found as
// the parent element of a button or label
const getParent = (element: HTMLElement): HTMLElement => {
  const parent = element.parentElement;
  if (!parent) {
    throw new Error(`No parent element for "${element.textContent}"`);
  }
  return parent;
};

interface TestComponentProps {
  noGoals?: boolean;
  hasNextPage?: boolean;
  endCursor?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  noGoals = false,
  hasNextPage = false,
  endCursor = null,
}) => (
  <TestRouter
    router={{
      query: { accountListId: 'account-list-1' },
    }}
  >
    <GqlMockedProvider<{
      GoalCalculations: GoalCalculationsQuery;
      CurrentMonthlyGoal: CurrentMonthlyGoalQuery;
    }>
      mocks={{
        GoalCalculations: {
          goalCalculations: {
            nodes: noGoals
              ? []
              : [
                  {
                    name: 'Annual Giving Goal',
                    primary: false,
                    updatedAt: '2019-11-01T12:00:00Z',
                  },
                  {
                    name: 'Monthly Support Goal',
                    primary: false,
                    updatedAt: '2019-12-01T12:00:00Z',
                  },
                  {
                    name: 'Partnership Goal',
                    primary: false,
                    updatedAt: '2019-10-01T12:00:00Z',
                  },
                ],
            pageInfo: {
              endCursor,
              hasNextPage,
            },
          },
        },
        CurrentMonthlyGoal: {
          accountList: { settings: { monthlyGoal: 6000 } },
        },
      }}
      onCall={mutationSpy}
    >
      <GoalsList />
    </GqlMockedProvider>
  </TestRouter>
);

describe('GoalsList', () => {
  it('renders the header and buttons', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Good Morning, User.' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('link', {
        name: 'Learn About Goalsetting (opens in a new tab)',
      }),
    ).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders goal calculations', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Support Goal' }),
    ).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders placeholder when there are no goals', async () => {
    const { findByRole } = render(<TestComponent noGoals />);

    expect(await findByRole('img')).toBeInTheDocument();
  });

  it('shows the monthly goal from MPDX settings when there are no goals', async () => {
    const { findByRole, queryByRole } = render(<TestComponent noGoals />);

    const currentGoalCard = await findByRole('region', {
      name: 'Current Monthly Goal',
    });
    expect(await within(currentGoalCard).findByText('$6,000')).toBeVisible();
    expect(await findByRole('img')).toBeInTheDocument();
    expect(
      queryByRole('region', { name: 'Calculated Monthly Goal' }),
    ).not.toBeInTheDocument();
  });

  it('shows the most recently updated goal next to the monthly goal', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('region', { name: 'Calculated Monthly Goal' }),
    ).toHaveTextContent('From your goal: Monthly Support Goal');
    expect(
      await findByRole('region', { name: 'Current Monthly Goal' }),
    ).toBeInTheDocument();
  });

  it('disables the create button while creating a goal', async () => {
    const { getByRole } = render(<TestComponent />);

    const button = getByRole('button', { name: 'Create a New Goal' });
    expect(button).not.toBeDisabled();

    userEvent.click(button);

    expect(button).toBeDisabled();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateGoalCalculation', {
        accountListId: 'account-list-1',
      }),
    );
  });

  it('fetches additional pages when hasNextPage is true', async () => {
    render(<TestComponent hasNextPage endCursor="cursor-1" />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GoalCalculations', {
        accountListId: 'account-list-1',
        after: 'cursor-1',
      }),
    );
  });

  describe('layout', () => {
    type GetByRole = ReturnType<typeof render>['getByRole'];

    const getButtons = (getByRole: GetByRole) => ({
      createButton: getByRole('button', { name: 'Create a New Goal' }),
      learnButton: getByRole('link', {
        name: 'Learn About Goalsetting (opens in a new tab)',
      }),
    });

    it('puts the Create and Learn buttons in the same row', () => {
      const { getByRole } = render(<TestComponent />);

      const { createButton, learnButton } = getButtons(getByRole);
      expect(createButton.nextElementSibling).toBe(learnButton);
    });

    it('stacks the Create and Learn buttons on phone widths', () => {
      const { getByRole } = render(<TestComponent />);

      const buttonRow = getParent(getButtons(getByRole).createButton);
      expect(getStyleAtWidth(buttonRow, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(buttonRow, 'flex-direction', phoneWidth)).toBe(
        'column',
      );
    });

    it('lets each stacked button fill the width on phone widths', () => {
      const { getByRole } = render(<TestComponent />);

      const { createButton, learnButton } = getButtons(getByRole);
      // A column flex container stretches its children to full width unless
      // the container or the child overrides the alignment or the width
      expect(
        getStyleAtWidth(getParent(createButton), 'align-items', phoneWidth) ||
          'stretch',
      ).toBe('stretch');
      [createButton, learnButton].forEach((button) => {
        expect(
          getStyleAtWidth(button, 'align-self', phoneWidth) || 'auto',
        ).toMatch(/^(auto|stretch)$/);
        expect(getStyleAtWidth(button, 'width', phoneWidth)).toBe('');
      });
    });

    it('keeps the Create and Learn buttons side by side on desktop widths', () => {
      const { getByRole } = render(<TestComponent />);

      const buttonRow = getParent(getButtons(getByRole).createButton);
      expect(getStyleAtWidth(buttonRow, 'display', desktopWidth)).toBe('flex');
      // An unset flex-direction is the CSS default, row
      expect(
        getStyleAtWidth(buttonRow, 'flex-direction', desktopWidth) || 'row',
      ).toBe('row');
    });

    it('makes the Create and Learn buttons at least 44px tall on phone widths', () => {
      const { getByRole } = render(<TestComponent />);

      const { createButton, learnButton } = getButtons(getByRole);
      [createButton, learnButton].forEach((button) => {
        expect(
          parseFloat(getStyleAtWidth(button, 'min-height', phoneWidth)),
        ).toBeGreaterThanOrEqual(44);
      });
    });

    it('keeps the default height of the Create and Learn buttons on desktop widths', () => {
      const { getByRole } = render(<TestComponent />);

      const { createButton, learnButton } = getButtons(getByRole);
      [createButton, learnButton].forEach((button) => {
        // '' or 'auto' both leave MUI's default button height in place
        expect(
          getStyleAtWidth(button, 'min-height', desktopWidth) || 'auto',
        ).toBe('auto');
        expect(getStyleAtWidth(button, 'height', desktopWidth)).toBe('');
      });
    });

    it("stacks each goal card's Last Updated label above its date only on phone widths", async () => {
      const { findAllByText } = render(<TestComponent />);

      const labels = await findAllByText('Last Updated');
      expect(labels).not.toHaveLength(0);
      labels.forEach((label) => {
        const row = getParent(label);
        expect(getStyleAtWidth(row, 'flex-direction', phoneWidth)).toBe(
          'column',
        );
        expect(
          getStyleAtWidth(row, 'flex-direction', desktopWidth) || 'row',
        ).toBe('row');
      });
    });
  });
});
