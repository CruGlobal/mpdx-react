import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import {
  DeepPartialMock,
  GqlMockedProvider,
} from '__tests__/util/graphqlMocking';
import { SendNewStaffScenarioGoalMutation } from 'src/components/HrTools/Shared/SendScenarioGoal/SendScenarioGoal.generated';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  NewStaffQuestionnaireMaritalStatusEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ScenarioGoals } from './ScenarioGoals';
import {
  CreateNewStaffScenarioGoalMutation,
  DeleteNewStaffScenarioGoalMutation,
  NewStaffScenarioGoalsQuery,
} from './ScenarioGoals.generated';

const accountListId = 'account-list-1';
const push = jest.fn();
const mutationSpy = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
  push,
};

type ScenarioGoalsMocks = {
  NewStaffScenarioGoals: NewStaffScenarioGoalsQuery;
  CreateNewStaffScenarioGoal: CreateNewStaffScenarioGoalMutation;
  DeleteNewStaffScenarioGoal: DeleteNewStaffScenarioGoalMutation;
  SendNewStaffScenarioGoal: SendNewStaffScenarioGoalMutation;
};

const scenarioGoalsMock: DeepPartial<NewStaffScenarioGoalsQuery> = {
  newStaffScenarioGoals: {
    nodes: [
      {
        id: 'scenario-1',
        firstName: 'John',
        lastName: 'Doe',
        ministryName: 'Cru Campus',
        geographicLocation: 'Orlando, FL',
        createdAt: '2026-08-01T12:00:00Z',
        maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
        calculationsYear: 2026,
        emailAddress: 'john@example.com',
        spouseEmailAddress: null,
        age: GoalCalculationAge.ThirtyToThirtyFour,
        tenure: 0,
        assignmentType: GoalCalculationRole.Field,
        benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Select,
        spouseAge: null,
        spouseTenure: null,
        calculations: { monthlyGoal: 5000 },
      },
      {
        id: 'scenario-2',
        firstName: null,
        lastName: null,
        ministryName: null,
        geographicLocation: null,
        createdAt: '2026-08-15T12:00:00Z',
        maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
        calculationsYear: null,
        emailAddress: null,
        spouseEmailAddress: null,
        age: null,
        tenure: null,
        assignmentType: null,
        benefitsPlan: null,
        spouseAge: null,
        spouseTenure: null,
        calculations: { monthlyGoal: 0 },
      },
    ],
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

// A 7-goal fixture forces a second page at the default page size of 5.
const manyScenarioGoalsMock: DeepPartial<NewStaffScenarioGoalsQuery> = {
  newStaffScenarioGoals: {
    nodes: Array.from({ length: 7 }, (_, index) => ({
      id: `scenario-${index}`,
      firstName: 'Person',
      lastName: `${index}`,
      ministryName: 'Cru Campus',
      geographicLocation: 'Orlando, FL',
      createdAt: '2026-08-01T12:00:00Z',
      calculations: { monthlyGoal: 1000 },
    })),
    pageInfo: { endCursor: null, hasNextPage: false },
  },
};

const sendScenarioGoalMock: DeepPartialMock<SendNewStaffScenarioGoalMutation> =
  {
    sendNewStaffScenarioGoal: {
      newStaffGoalCalculation: { id: 'scenario-1' },
      sentTo: ['john@example.com'],
    },
  };

const renderScenarioGoals = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<ScenarioGoalsMocks>
            mocks={
              {
                NewStaffScenarioGoals: scenarioGoalsMock,
                SendNewStaffScenarioGoal: sendScenarioGoalMock,
                ...mocks,
              } as ApolloErgonoMockMap
            }
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
  it('shows a loading indicator until the query resolves', async () => {
    const { getByLabelText, findByRole } = renderScenarioGoals();

    expect(getByLabelText('Loading scenario goals')).toBeInTheDocument();

    expect(await findByRole('link', { name: 'John Doe' })).toBeInTheDocument();
  });

  it('renders the table with a dash for missing values and an untitled label', async () => {
    const { findByRole, getByRole } = renderScenarioGoals();

    await findByRole('link', { name: 'John Doe' });
    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: [
        'Name',
        'Ministry',
        'Campus Division',
        'MPD Goal',
        'Goal Status',
        'Created',
        'Actions',
      ],
      cells: [
        [
          'John Doe',
          'Cru Campus',
          'Orlando, FL',
          '$5,000',
          'Complete',
          '8/1/2026',
          '',
        ],
        ['Untitled scenario', '—', '—', '$0', 'Incomplete', '8/15/2026', ''],
      ],
    });
  });

  it('emails the worksheet for a scenario goal from its row', async () => {
    const { findByRole, findByText, getByRole, getByText } =
      renderScenarioGoals();

    userEvent.click(await findByRole('button', { name: 'Email John Doe' }));

    expect(
      getByText(
        'Email the support goals worksheet for John Doe to john@example.com? This cannot be undone.',
      ),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Send Worksheet' }));

    expect(
      await findByText('Support goals worksheet sent to john@example.com.'),
    ).toBeInTheDocument();
    expect(mutationSpy).toHaveGraphqlOperation('SendNewStaffScenarioGoal', {
      id: 'scenario-1',
    });
  });

  it('blocks sending a scenario goal that is missing required fields', async () => {
    const { findByRole, getByRole, findByText } = renderScenarioGoals();

    await findByRole('link', { name: 'John Doe' });
    const send = getByRole('button', { name: 'Email Untitled scenario' });
    expect(send).toBeDisabled();

    // The tooltip lives on the wrapper span; a disabled button takes no pointer events.
    await userEvent.hover(send.parentElement as HTMLElement);
    expect(
      await findByText(
        'A first name, last name, campus division, and year are required before the worksheet can be emailed.',
      ),
    ).toBeInTheDocument();
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

  it('paginates: shows five rows per page and the rest on the next page', async () => {
    const { findByRole, getByRole, queryByRole } = renderScenarioGoals({
      NewStaffScenarioGoals: manyScenarioGoalsMock,
    } as ApolloErgonoMockMap);

    expect(await findByRole('link', { name: 'Person 0' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Person 4' })).toBeInTheDocument();
    // Rows beyond the first page are not rendered yet.
    expect(queryByRole('link', { name: 'Person 5' })).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Go to next page' }));

    expect(await findByRole('link', { name: 'Person 5' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Person 6' })).toBeInTheDocument();
    expect(queryByRole('link', { name: 'Person 0' })).not.toBeInTheDocument();
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

  it('does not navigate and re-enables the button when creating fails', async () => {
    const { findByRole } = renderScenarioGoals({
      CreateNewStaffScenarioGoal: {
        createNewStaffScenarioGoal: () => {
          throw new Error('Create failed');
        },
      },
    });

    const createButton = await findByRole('button', {
      name: 'New Scenario Goal',
    });
    userEvent.click(createButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CreateNewStaffScenarioGoal'),
    );
    await waitFor(() => expect(createButton).toBeEnabled());
    expect(push).not.toHaveBeenCalled();
  });

  it('deletes a scenario goal after confirmation and removes its row', async () => {
    const { findByRole, getByRole, queryByRole } = renderScenarioGoals();

    userEvent.click(await findByRole('button', { name: 'Delete John Doe' }));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteNewStaffScenarioGoal', {
        id: 'scenario-1',
      }),
    );
    // The mutation evicts the goal from the cache, so its row disappears.
    await waitFor(() =>
      expect(queryByRole('link', { name: 'John Doe' })).not.toBeInTheDocument(),
    );
  });

  it('keeps the row when deleting fails', async () => {
    const { findByRole, getByRole } = renderScenarioGoals({
      DeleteNewStaffScenarioGoal: {
        deleteNewStaffScenarioGoal: () => {
          throw new Error('Delete failed');
        },
      },
    });

    userEvent.click(await findByRole('button', { name: 'Delete John Doe' }));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteNewStaffScenarioGoal', {
        id: 'scenario-1',
      }),
    );
    // findBy retries until the confirmation dialog's aria-hidden lifts.
    expect(await findByRole('link', { name: 'John Doe' })).toBeInTheDocument();
  });

  it('drains every page of scenario goals', async () => {
    const secondPageGoal: DeepPartial<
      NewStaffScenarioGoalsQuery['newStaffScenarioGoals']['nodes'][number]
    > = {
      id: 'scenario-3',
      firstName: 'Page',
      lastName: 'Two',
      ministryName: 'Cru Campus',
      geographicLocation: 'Orlando, FL',
      createdAt: '2026-08-20T12:00:00Z',
      calculations: { monthlyGoal: 750 },
    };
    const { findByRole, getByRole, getAllByRole } = renderScenarioGoals({
      NewStaffScenarioGoals: {
        newStaffScenarioGoals: (_root: unknown, args: { after?: string }) =>
          args.after
            ? {
                nodes: [secondPageGoal],
                pageInfo: { endCursor: 'cursor-2', hasNextPage: false },
              }
            : {
                ...scenarioGoalsMock.newStaffScenarioGoals,
                pageInfo: { endCursor: 'cursor-1', hasNextPage: true },
              },
      },
    });

    expect(await findByRole('link', { name: 'Page Two' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'John Doe' })).toBeInTheDocument();
    expect(getAllByRole('row')).toHaveLength(4);
  });
});
