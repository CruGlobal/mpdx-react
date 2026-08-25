import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalAdmin } from './MpdGoalAdmin';
import { MpdGoalAdminProvider } from './MpdGoalAdminContext';
import { attendeesMock, cohortsMock } from './mpdGoalAdminMocks';

const renderMain = (mocks: Record<string, unknown> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider
          mocks={{
            NewStaffCohorts: cohortsMock,
            NewStaffCohortAttendees: attendeesMock(),
            ...mocks,
          }}
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
  });

  it('surfaces a query failure instead of an empty table', async () => {
    // These queries are restricted to the MPD Goals team, so an unauthorized
    // user must see why the table is empty rather than "No goals found".
    const { findByRole, queryByRole } = renderMain({
      NewStaffCohorts: {
        newStaffCohorts: () => {
          throw new Error('Not authorized');
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent('Not authorized');
    expect(queryByRole('table')).not.toBeInTheDocument();
  });

  it('switches to the scenario goals placeholder', async () => {
    const { getByRole, queryByRole, getByText, findByRole } = renderMain();
    await findByRole('table');

    await userEvent.click(getByRole('tab', { name: 'Scenario Goals' }));

    expect(queryByRole('table')).not.toBeInTheDocument();
    expect(getByText('Scenario goals coming soon.')).toBeInTheDocument();
  });
});
