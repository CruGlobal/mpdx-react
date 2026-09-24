import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import { ManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import { MpdSupervisorReportProvider } from '../MpdSupervisorReportContext';
import {
  managedStaffMember,
  managedStaffMock,
  managedStaffTeamsMock,
} from '../mpdSupervisorReportMocks';
import { TeamSummary } from './TeamSummary';

const mutationSpy = jest.fn();

const quarter = (status: MpdHealthStatusEnum) => ({
  fiscalYear: 2026,
  quarter: 3,
  averagePayroll: 1000,
  status,
});

const campusRed = managedStaffMember({
  firstName: 'Anton',
  personNumber: '1',
  staffAccountId: 'a1',
  spousePersonNumber: null,
  teams: {
    employee: [{ id: 'campus', name: 'Campus', department: 'US Campus' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [quarter(MpdHealthStatusEnum.Red)],
  },
});
const cityGreen = managedStaffMember({
  firstName: 'Brooke',
  personNumber: '2',
  staffAccountId: 'a2',
  spousePersonNumber: null,
  teams: {
    employee: [{ id: 'city', name: 'City', department: 'US City' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [quarter(MpdHealthStatusEnum.Green)],
  },
});
const cityYellow = managedStaffMember({
  firstName: 'Carla',
  personNumber: '3',
  staffAccountId: 'a3',
  spousePersonNumber: null,
  teams: {
    employee: [{ id: 'city', name: 'City', department: 'US City' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [quarter(MpdHealthStatusEnum.Yellow)],
  },
});

const renderSummary = (
  teams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
    { name: 'Campus', departments: ['US Campus'] },
    { name: 'City', departments: ['US City'] },
  ],
) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ManagedStaff: ManagedStaffQuery;
          ManagedStaffTeams: ManagedStaffTeamsQuery;
        }>
          mocks={{
            ManagedStaff: managedStaffMock([campusRed, cityGreen, cityYellow]),
            ManagedStaffTeams: managedStaffTeamsMock(teams),
          }}
          onCall={mutationSpy}
        >
          <MpdSupervisorReportProvider>
            <TeamSummary />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('TeamSummary', () => {
  it('renders nothing for a supervisor with one team', async () => {
    const { queryByRole } = renderSummary([
      { name: 'Campus', departments: ['US Campus'] },
    ]);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeams', {}),
    );
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {}),
    );
    expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();
  });

  it('summarises each team in the results, worst first', async () => {
    const { findByRole } = renderSummary();

    const region = await findByRole('region', { name: 'Teams' });
    const cards = within(region).getAllByRole('button');
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('Campus');
    expect(cards[0]).toHaveTextContent('1 staff');
    expect(cards[0]).toHaveTextContent('1 at risk');
    expect(cards[1]).toHaveTextContent('City');
    expect(cards[1]).toHaveTextContent('2 staff');
    expect(cards[1]).toHaveTextContent('1 needs attention');
    expect(cards[1]).toHaveTextContent('1 on track');
    expect(cards[1]).not.toHaveTextContent('at risk');
  });

  it('toggles the team filter from a card', async () => {
    const { findByRole } = renderSummary();
    const region = await findByRole('region', { name: 'Teams' });
    const campus = within(region).getByRole('button', { name: /Campus/ });
    expect(campus).toHaveAttribute('aria-pressed', 'false');

    userEvent.click(campus);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: ['Campus'],
      }),
    );
    // The cards re-render once the filtered result arrives, so find it again
    const pressed = await findByRole('button', {
      name: /Campus/,
      pressed: true,
    });

    userEvent.click(pressed);

    expect(
      await findByRole('button', { name: /Campus/, pressed: false }),
    ).toBeInTheDocument();
  });
});
