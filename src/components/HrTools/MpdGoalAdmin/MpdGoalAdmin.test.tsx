import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdmin } from './MpdGoalAdmin';
import { MpdGoalAdminProvider } from './MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';
import { attendeesMock, cohortsMock, noCohortsMock } from './mpdGoalAdminMocks';

type Mocks = {
  NewStaffCohorts: NewStaffCohortsQuery;
  NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
};

const router = {
  query: { accountListId: 'account-list-1' },
  isReady: true,
  push: jest.fn(),
};

const renderMain = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<Mocks>
            mocks={
              {
                NewStaffCohorts: cohortsMock,
                NewStaffCohortAttendees: attendeesMock(),
                ...mocks,
              } as ApolloErgonoMockMap
            }
          >
            <MpdGoalAdminProvider>
              <MpdGoalAdmin onNavListToggle={jest.fn()} navListOpen={false} />
            </MpdGoalAdminProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>,
  );

describe('MpdGoalAdmin', () => {
  it('renders the title and the active goals table', async () => {
    const { getByText, findByRole, findByText } = renderMain();

    expect(getByText('MPD Goal Calculator - Admin Table')).toBeInTheDocument();
    expect(await findByRole('table')).toBeInTheDocument();
    expect(await findByText('John & Jane Doe')).toBeInTheDocument();
  });

  it('shows a loading indicator until the attendees arrive', () => {
    const { getByRole, queryByRole } = renderMain();

    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Run and Send All' })).toBeDisabled();
  });

  it('surfaces a query failure instead of an empty table', async () => {
    // Show why the table is empty, not "No goals found".
    const { findByRole, getByRole, queryByRole } = renderMain({
      NewStaffCohorts: {
        newStaffCohorts: () => {
          throw new Error('Not authorized');
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent('Not authorized');
    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Run and Send All' })).toBeDisabled();
  });

  it('shows the no-training empty state when no cohort is selected', async () => {
    // Role scoping can leave a user with no cohorts at all; the auto-select in
    // MpdGoalAdminContext then has nothing to pick and the table is meaningless.
    const { findByTestId, getByText, queryByRole } = renderMain({
      NewStaffCohorts: noCohortsMock,
    });

    expect(await findByTestId('no-training-selected')).toBeInTheDocument();
    expect(getByText('No Training Selected')).toBeInTheDocument();
    expect(
      getByText('There are no trainings available for you to manage.'),
    ).toBeInTheDocument();
    expect(queryByRole('table')).not.toBeInTheDocument();
  });

  it('hides the goals toolbar while the empty state is showing', async () => {
    const { findByTestId, queryByRole } = renderMain({
      NewStaffCohorts: noCohortsMock,
    });

    await findByTestId('no-training-selected');
    expect(
      queryByRole('button', { name: 'Run and Send All' }),
    ).not.toBeInTheDocument();
    expect(queryByRole('textbox', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('keeps the training selector visible in the empty state', async () => {
    // The bar carries the Training dropdown, so hiding it would strand the user.
    const { findByTestId, getByRole } = renderMain({
      NewStaffCohorts: noCohortsMock,
    });

    await findByTestId('no-training-selected');
    expect(getByRole('combobox', { name: 'Training' })).toBeInTheDocument();
  });

  it('switches to the scenario goals tab', async () => {
    const { getByRole, findByRole } = renderMain();
    await userEvent.click(getByRole('tab', { name: 'Scenario Goals' }));
    expect(
      await findByRole('button', { name: 'New Scenario Goal' }),
    ).toBeInTheDocument();
  });
});
