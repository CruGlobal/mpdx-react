import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdmin } from './MpdGoalAdmin';
import { MpdGoalAdminProvider } from './MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from './NewStaffCohorts.generated';
import { attendeesMock, cohortsMock } from './mpdGoalAdminMocks';

type Mocks = {
  NewStaffCohorts: NewStaffCohortsQuery;
  NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
};

const renderMain = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
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

  it('switches to the scenario goals placeholder', async () => {
    const { getByRole, queryByRole, getByText, findByRole } = renderMain();
    await findByRole('table');

    userEvent.click(getByRole('tab', { name: 'Scenario Goals' }));

    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(getByText('Scenario goals coming soon.')).toBeInTheDocument();
  });
});
