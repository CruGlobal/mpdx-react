import React from 'react';
import { DefaultOptions } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
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
import { maxTeamPickerCards } from '../helpers';
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
    employee: [{ id: 'campus', name: 'Campus' }],
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
    employee: [{ id: 'city', name: 'City' }],
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
    employee: [{ id: 'city', name: 'City' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [quarter(MpdHealthStatusEnum.Yellow)],
  },
});

const cityBlue = managedStaffMember({
  firstName: 'Dana',
  personNumber: '4',
  staffAccountId: 'a4',
  spousePersonNumber: null,
  teams: {
    employee: [{ id: 'city', name: 'City' }],
    spouse: [],
  },
  quarterlyHealth: {
    monthlyGrossSalary: 4500,
    completedQuarters: [quarter(MpdHealthStatusEnum.Blue)],
  },
});

const twoTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
  { name: 'Campus', departments: ['US Campus'] },
  { name: 'City', departments: ['US City'] },
];

let setDepartmentFn: (value: string | null) => void;
const Controls: React.FC = () => {
  const { setDepartment } = useMpdSupervisorReport();
  setDepartmentFn = setDepartment;
  return null;
};

const renderSummary = (
  teams: ManagedStaffTeamsQuery['managedStaffTeams'] = twoTeams,
  mocks: ApolloErgonoMockMap = {},
  defaultOptions?: DefaultOptions,
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
          defaultOptions={defaultOptions}
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
    const cards = within(region).getAllByRole('button', { pressed: false });
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

  it('counts ungraded staff on their team', async () => {
    const { findByRole } = renderSummary(twoTeams, {
      ManagedStaff: managedStaffMock([campusRed, cityBlue]),
    });

    const region = await findByRole('region', { name: 'Teams' });
    const city = within(region).getByRole('button', { name: /City/ });
    expect(city).toHaveTextContent('1 staff');
    expect(city).toHaveTextContent('Ungraded (1)');
  });

  it('orders the badges like the bar, worst first, then ungraded', async () => {
    const cityRed = managedStaffMember({
      ...campusRed,
      firstName: 'Eli',
      personNumber: '5',
      staffAccountId: 'a5',
      teams: cityGreen.teams,
    });
    const { findByRole } = renderSummary(twoTeams, {
      ManagedStaff: managedStaffMock([
        campusRed,
        cityGreen,
        cityYellow,
        cityBlue,
        cityRed,
      ]),
    });

    const region = await findByRole('region', { name: 'Teams' });
    const city = within(region).getByRole('button', { name: /City/ });
    expect(city).toHaveTextContent(
      /At risk \(1\).*Needs attention \(1\).*On track \(1\).*Ungraded \(1\)/,
    );
  });

  it('starts open and collapses the cards from its heading', async () => {
    const { findByRole, getByRole, queryByRole } = renderSummary();
    const toggle = await findByRole('button', { name: 'Teams (2)' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('button', { name: /Campus/ })).toBeInTheDocument();

    userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(queryByRole('button', { name: /Campus/ })).not.toBeInTheDocument(),
    );

    userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('button', { name: /Campus/ })).toBeInTheDocument();
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

  it('hides the old cards while a new filter loads', async () => {
    const { findByRole, queryByRole } = renderSummary();
    await findByRole('region', { name: 'Teams' });

    act(() => {
      setDepartmentFn('US City');
    });

    expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();
    expect(await findByRole('region', { name: 'Teams' })).toBeInTheDocument();
  });

  it('marks cached cards busy while they refresh', async () => {
    // The app's defaults, which show cached cards while a request refreshes them
    const { findByRole, getByRole } = renderSummary(
      twoTeams,
      {},
      {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          notifyOnNetworkStatusChange: true,
        },
      },
    );
    await findByRole('region', { name: 'Teams' });
    act(() => {
      setDepartmentFn('US City');
    });
    await findByRole('region', { name: 'Teams' });

    act(() => {
      setDepartmentFn(null);
    });

    expect(getByRole('region', { name: 'Teams' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await waitFor(() =>
      expect(getByRole('region', { name: 'Teams' })).toHaveAttribute(
        'aria-busy',
        'false',
      ),
    );
  });

  describe('over the row cap', () => {
    const rowCap = (count = 129) =>
      new GraphQLError(`${count} staff are in reach`, {
        extensions: { code: 'FILTER_REQUIRED', count, filtered: false },
      });
    const filterGuard: ApolloErgonoMockMap = {
      ManagedStaff: {
        managedStaff: () => {
          throw rowCap();
        },
      },
    };
    const cohortTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
      { name: 'North Team', departments: ['Cohort A'] },
      { name: 'South Team', departments: ['Cohort A'] },
      { name: 'East Team', departments: ['Cohort B'] },
    ];

    it('offers a name-only card per team', async () => {
      const { findByRole } = renderSummary(cohortTeams, filterGuard);

      const region = await findByRole('region', { name: 'Teams' });
      expect(
        within(region).getByRole('button', { name: 'Teams (3)' }),
      ).toBeInTheDocument();
      const cards = within(region).getAllByRole('button', { pressed: false });
      expect(cards.map((card) => card.textContent)).toEqual([
        'East Team',
        'North Team',
        'South Team',
      ]);
    });

    it("offers only the picked department's teams", async () => {
      const { findByRole, getByRole } = renderSummary(cohortTeams, filterGuard);
      await findByRole('region', { name: 'Teams' });

      act(() => {
        setDepartmentFn('Cohort A');
      });

      await waitFor(() =>
        expect(getByRole('button', { name: 'Teams (2)' })).toBeInTheDocument(),
      );
      expect(
        within(getByRole('region', { name: 'Teams' }))
          .getAllByRole('button', { pressed: false })
          .map((card) => card.textContent),
      ).toEqual(['North Team', 'South Team']);
    });

    it('offers nothing when the department has one team', async () => {
      const { findByRole, queryByRole } = renderSummary(
        cohortTeams,
        filterGuard,
      );
      await findByRole('region', { name: 'Teams' });

      act(() => {
        setDepartmentFn('Cohort B');
      });

      await waitFor(() =>
        expect(
          queryByRole('region', { name: 'Teams' }),
        ).not.toBeInTheDocument(),
      );
    });

    it('offers nothing past the card limit until a department narrows it', async () => {
      const manyTeams = Array.from(
        { length: maxTeamPickerCards + 1 },
        (_, index) => ({
          name: `Team ${index + 1}`,
          departments: [index < 3 ? 'Cohort A' : 'Cohort B'],
        }),
      );
      const { findByRole, queryByRole } = renderSummary(manyTeams, filterGuard);
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeams', {}),
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {}),
      );
      expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();

      act(() => {
        setDepartmentFn('Cohort A');
      });

      expect(
        await findByRole('button', { name: 'Teams (3)' }),
      ).toBeInTheDocument();
    });

    it('toggles the team filter from a card', async () => {
      const { findByRole } = renderSummary(cohortTeams, filterGuard);
      const region = await findByRole('region', { name: 'Teams' });

      userEvent.click(
        within(region).getByRole('button', { name: 'North Team' }),
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
          teamNames: ['North Team'],
        }),
      );
      const pressed = await findByRole('button', {
        name: 'North Team',
        pressed: true,
      });

      userEvent.click(pressed);

      expect(
        await findByRole('button', { name: 'North Team', pressed: false }),
      ).toBeInTheDocument();
    });

    it('stays once a team fits but its department does not', async () => {
      const { findByRole, getByRole } = renderSummary(cohortTeams, {
        ManagedStaff: {
          managedStaff: (
            _root: unknown,
            args: { teamNames?: string[] | null },
          ) => {
            if (!args.teamNames) {
              throw rowCap();
            }
            return managedStaffMock([campusRed]).managedStaff;
          },
        },
      });
      const region = await findByRole('region', { name: 'Teams' });

      userEvent.click(
        within(region).getByRole('button', { name: 'North Team' }),
      );

      expect(
        await findByRole('button', { name: 'North Team', pressed: true }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
          teamNames: null,
        }),
      );
      // The cards are still the picker, not a summary of the one team's rows
      expect(getByRole('button', { name: 'Teams (3)' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'South Team' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    it('keeps the picked team on screen while another filter loads', async () => {
      let answerDepartment = () => {};
      const departmentAnswered = new Promise<void>((resolve) => {
        answerDepartment = resolve;
      });
      const { findByRole, getByRole } = renderSummary(cohortTeams, {
        ManagedStaff: {
          managedStaff: async (
            _root: unknown,
            args: {
              teamNames?: string[] | null;
              departments?: string[] | null;
            },
          ) => {
            if (!args.teamNames) {
              if (args.departments) {
                await departmentAnswered;
              }
              throw rowCap();
            }
            return managedStaffMock([campusRed]).managedStaff;
          },
        },
      });
      const region = await findByRole('region', { name: 'Teams' });
      userEvent.click(
        within(region).getByRole('button', { name: 'North Team' }),
      );
      await findByRole('button', { name: 'North Team', pressed: true });
      // The roster's first answer, then the strip's own teamless answer
      const teamlessAnswers = () =>
        mutationSpy.mock.calls.filter(
          ([{ operation }]) =>
            operation.operationName === 'ManagedStaff' &&
            !operation.variables.teamNames &&
            !operation.variables.departments,
        ).length;
      await waitFor(() => expect(teamlessAnswers()).toBe(2));
      await act(async () => {});
      expect(getByRole('button', { name: 'Teams (3)' })).toBeInTheDocument();

      act(() => {
        setDepartmentFn('Cohort A');
      });
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
          teamNames: ['North Team'],
          departments: ['Cohort A'],
        }),
      );

      // The department's teamless request has not answered yet
      expect(
        getByRole('button', { name: 'North Team', pressed: true }),
      ).toBeInTheDocument();
      answerDepartment();
      expect(
        await findByRole('button', { name: 'Teams (2)' }),
      ).toBeInTheDocument();
    });
  });
});
