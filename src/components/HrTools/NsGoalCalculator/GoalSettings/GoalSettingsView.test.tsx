import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeTestResizeObserver } from '__tests__/util/windowResizeObserver';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsView } from './GoalSettingsView';

const mutationSpy = jest.fn();
const query = { accountListId: 'coach-1', coachingId: 'coaching-account-1' };

const TestComponent: React.FC<{ view?: string }> = ({ view }) => (
  <NsGoalCalculatorTestWrapper
    router={{
      pathname:
        '/accountLists/[accountListId]/coaching/[coachingId]/nsGoalCalculator',
      query: {
        ...query,
        view,
      },
    }}
  >
    <GoalSettingsView accountListId="coaching-account-1" />
  </NsGoalCalculatorTestWrapper>
);

describe('GoalSettingsView', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  it('renders the Goal Settings form by default', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
  });

  it('renders the Review content when the view param selects it', async () => {
    const { findByRole } = render(<TestComponent view="review-your-goal" />);

    expect(
      await findByRole('heading', { name: 'Review Your Calculation' }),
    ).toBeInTheDocument();
  });

  it('renders the Presenting content', async () => {
    const { findByRole } = render(<TestComponent view="present-your-goal" />);

    expect(
      await findByRole('heading', { name: 'Presenting Your Goal' }),
    ).toBeInTheDocument();
  });

  it('always renders the sidebar', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: /Staff Documents/ }),
    ).toBeInTheDocument();
  });

  it('collapses and re-expands the navigation, moving focus with it', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

    await findByRole('heading', { name: 'Personal Information' });

    expect(
      queryByRole('button', { name: 'Show navigation' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Collapse navigation' }));

    // Collapsing moves focus to the expand button so it isn't dropped.
    const showButton = await findByRole('button', { name: 'Show navigation' });
    expect(showButton).toHaveFocus();

    userEvent.click(showButton);

    // Re-expanding removes the expand button and returns focus to the collapse
    // button.
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Collapse navigation' }),
      ).toHaveFocus(),
    );
    expect(
      queryByRole('button', { name: 'Show navigation' }),
    ).not.toBeInTheDocument();
  });

  it('does not move focus into the nav on initial render', async () => {
    const { findByRole, getByRole } = render(
      <React.StrictMode>
        <TestComponent />
      </React.StrictMode>,
    );

    await findByRole('heading', { name: 'Personal Information' });

    expect(
      getByRole('button', { name: 'Collapse navigation' }),
    ).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  describe('scenario goals', () => {
    const ScenarioTestComponent: React.FC<{ view?: string }> = ({ view }) => (
      <NsGoalCalculatorTestWrapper
        onCall={mutationSpy}
        router={{
          pathname:
            '/accountLists/[accountListId]/hrTools/mpdGoalAdmin/scenario/[scenarioGoalId]',
          query: {
            ...query,
            view,
          },
        }}
      >
        <GoalSettingsView scenarioGoalId="scenario-1" />
      </NsGoalCalculatorTestWrapper>
    );

    it('queries the goal by scenario id', async () => {
      const { findByRole } = render(<ScenarioTestComponent />);

      await findByRole('heading', { name: 'Contact Info' });

      expect(mutationSpy).toHaveGraphqlOperation('NewStaffGoalCalculation', {
        accountListId: null,
        id: 'scenario-1',
      });
    });

    it('renders the editable form by default', async () => {
      const { findByRole } = render(<ScenarioTestComponent />);

      expect(
        await findByRole('heading', { name: 'Contact Info' }),
      ).toBeInTheDocument();
    });

    it('renders the Review content for a scenario goal', async () => {
      const { findByRole } = render(
        <ScenarioTestComponent view="review-your-goal" />,
      );

      expect(
        await findByRole('heading', { name: 'Review Your Calculation' }),
      ).toBeInTheDocument();
    });

    it('omits the Presenting content for a scenario goal, falling back to Goal Settings', async () => {
      const { findByRole, queryByRole } = render(
        <ScenarioTestComponent view="present-your-goal" />,
      );

      expect(
        await findByRole('heading', { name: 'Contact Info' }),
      ).toBeInTheDocument();
      expect(
        queryByRole('heading', { name: 'Presenting Your Goal' }),
      ).not.toBeInTheDocument();
    });
  });
});
