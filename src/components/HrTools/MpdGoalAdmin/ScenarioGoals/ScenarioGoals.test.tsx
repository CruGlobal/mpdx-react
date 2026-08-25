import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ScenarioGoals } from './ScenarioGoals';

const accountListId = 'account-list-1';
const push = jest.fn();
const mutationSpy = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
  push,
};

const scenarioGoalsMock = {
  newStaffScenarioGoals: {
    nodes: [
      {
        id: 'scenario-1',
        firstName: 'John',
        lastName: 'Doe',
        ministryName: 'Cru Campus',
        geographicLocation: 'Orlando, FL',
        createdAt: '2026-08-01T12:00:00Z',
        calculations: { monthlyGoal: 5000 },
      },
      {
        id: 'scenario-2',
        firstName: null,
        lastName: null,
        ministryName: null,
        geographicLocation: null,
        createdAt: '2026-08-15T12:00:00Z',
        calculations: { monthlyGoal: 0 },
      },
    ],
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

const renderScenarioGoals = (mocks: Record<string, unknown> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider
            mocks={{ NewStaffScenarioGoals: scenarioGoalsMock, ...mocks }}
            onCall={mutationSpy}
          >
            <ScenarioGoals />
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ScenarioGoals', () => {
  it('renders a row per scenario goal, falling back to an untitled label', async () => {
    const { findByRole, getByRole } = renderScenarioGoals();

    expect(await findByRole('link', { name: 'John Doe' })).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'Untitled scenario' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$5,000' })).toBeInTheDocument();
  });

  it('links each scenario goal to its calculator page', async () => {
    const { findByRole } = renderScenarioGoals();

    expect(await findByRole('link', { name: 'John Doe' })).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/scenario/scenario-1`,
    );
  });

  it('shows an empty state when there are no scenario goals', async () => {
    const { findByText } = renderScenarioGoals({
      NewStaffScenarioGoals: {
        newStaffScenarioGoals: {
          nodes: [],
          pageInfo: { endCursor: null, hasNextPage: false },
        },
      },
    });

    expect(
      await findByText('No scenario goals yet. Create one to get started.'),
    ).toBeInTheDocument();
  });

  it('surfaces a query failure instead of an empty list', async () => {
    const { findByRole } = renderScenarioGoals({
      NewStaffScenarioGoals: {
        newStaffScenarioGoals: () => {
          throw new Error('Not authorized');
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent('Not authorized');
  });

  it('creates a scenario goal and navigates to it', async () => {
    const { findByRole } = renderScenarioGoals({
      CreateNewStaffScenarioGoal: {
        createNewStaffScenarioGoal: {
          newStaffGoalCalculation: { id: 'new-scenario' },
        },
      },
    });

    userEvent.click(await findByRole('button', { name: 'New Scenario Goal' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateNewStaffScenarioGoal'),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        `/accountLists/${accountListId}/hrTools/mpdGoalAdmin/scenario/new-scenario`,
      ),
    );
  });

  it('deletes a scenario goal after confirmation', async () => {
    const { findByRole, getByRole } = renderScenarioGoals();

    userEvent.click(await findByRole('button', { name: 'Delete John Doe' }));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteNewStaffScenarioGoal', {
        id: 'scenario-1',
      }),
    );
  });
});

describe('ScenarioGoals query', () => {
  it('loads the scenario goals list', async () => {
    renderScenarioGoals();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('NewStaffScenarioGoals'),
    );
  });
});
