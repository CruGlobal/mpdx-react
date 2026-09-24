import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import { ManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
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

const twoTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
  { name: 'Campus', departments: ['US Campus'] },
  { name: 'City', departments: ['US City'] },
];

let setDepartmentFn: (value: string | null) => void;
let setSearchFn: (value: string) => void;
const Controls: React.FC = () => {
  const { setDepartment, setSearch } = useMpdSupervisorReport();
  setDepartmentFn = setDepartment;
  setSearchFn = setSearch;
  return null;
};

const renderSummary = (
  teams: ManagedStaffTeamsQuery['managedStaffTeams'] = twoTeams,
  mocks: ApolloErgonoMockMap = {},
) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ManagedStaff: ManagedStaffQuery;
          ManagedStaffTeams: ManagedStaffTeamsQuery;
        }>
          mocks={
            {
              ManagedStaff: managedStaffMock([
                campusRed,
                cityGreen,
                cityYellow,
              ]),
              ManagedStaffTeams: managedStaffTeamsMock(teams),
              ...mocks,
            } as ApolloErgonoMockMap
          }
          onCall={mutationSpy}
        >
          <MpdSupervisorReportProvider>
            <Controls />
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
    expect(cards[0]).toHaveTextContent('At risk (1)');
    expect(cards[1]).toHaveTextContent('City');
    expect(cards[1]).toHaveTextContent('2 staff');
    expect(cards[1]).toHaveTextContent('Needs attention (1)');
    expect(cards[1]).toHaveTextContent('On track (1)');
    expect(cards[1]).not.toHaveTextContent('At risk');
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

  it('waits for every page before showing any counts', async () => {
    const page1 = managedStaffMock([campusRed]);
    page1.managedStaff.pageInfo = { endCursor: 'cursor-1', hasNextPage: true };
    const page2 = managedStaffMock([cityGreen, cityYellow]);
    const { findByRole } = renderSummary(twoTeams, {
      ManagedStaff: {
        managedStaff: (_root: unknown, args: { after?: string | null }) =>
          args.after ? page2.managedStaff : page1.managedStaff,
      },
    });

    const region = await findByRole('region', { name: 'Teams' });
    // Both pages are in: City only exists on the second page
    expect(
      within(region).getByRole('button', { name: /City/ }),
    ).toHaveTextContent('2 staff');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        after: 'cursor-1',
      }),
    );
  });

  it('summarises every team even while one is selected', async () => {
    const { findByRole } = renderSummary();
    const region = await findByRole('region', { name: 'Teams' });

    userEvent.click(within(region).getByRole('button', { name: /Campus/ }));

    const pressed = await findByRole('button', {
      name: /Campus/,
      pressed: true,
    });
    expect(pressed).toBeInTheDocument();
    // The summary query never carries the team filter
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        teamNames: ['Campus'],
      }),
    );
    const summaryCalls = mutationSpy.mock.calls.filter(
      ([{ operation }]) =>
        operation.operationName === 'ManagedStaff' &&
        operation.variables.teamNames === null,
    );
    expect(summaryCalls.length).toBeGreaterThan(0);
    expect(
      within(await findByRole('region', { name: 'Teams' })).getByRole(
        'button',
        {
          name: /City/,
        },
      ),
    ).toHaveTextContent('2 staff');
  });

  it('says so when the teams cannot be loaded', async () => {
    const { findByRole, queryByRole } = renderSummary(twoTeams, {
      ManagedStaffTeams: {
        managedStaffTeams: () => {
          throw new Error('Teams unavailable');
        },
      },
    });

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(
      'Could not load your teams: Teams unavailable',
    );
    expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();
  });

  it('only lists teams in the selected department, since the API reads team + department as one team', async () => {
    const { findByRole, queryByRole } = renderSummary();
    await findByRole('region', { name: 'Teams' });

    act(() => {
      setDepartmentFn('US City');
    });

    await waitFor(() =>
      expect(queryByRole('button', { name: /Campus/ })).not.toBeInTheDocument(),
    );
    expect(await findByRole('button', { name: /City/ })).toBeInTheDocument();
  });

  it('keeps the cards on screen, marked busy, while a new filter loads', async () => {
    const { findByRole, getByRole } = renderSummary();
    await findByRole('region', { name: 'Teams' });

    act(() => {
      setSearchFn('Anton');
    });

    // Never unmounted: the region is still there straight after the change
    const region = getByRole('region', { name: 'Teams' });
    expect(region).toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        name: 'Anton',
        teamNames: null,
      }),
    );
    await waitFor(() =>
      expect(getByRole('region', { name: 'Teams' })).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
  });
});
