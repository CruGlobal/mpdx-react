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
import { ManagedStaffTeamSummaryQuery } from '../ManagedStaffTeamSummary.generated';
import { ManagedStaffTeamsQuery } from '../ManagedStaffTeams.generated';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import { maxTeamPickerCards } from '../helpers';
import {
  managedStaffMember,
  managedStaffMock,
  managedStaffTeamSummaryMock,
  managedStaffTeamsMock,
  teamSummary,
} from '../mpdSupervisorReportMocks';
import { TeamSummary } from './TeamSummary';

const mutationSpy = jest.fn();

const twoTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
  { name: 'Campus', departments: ['US Campus'] },
  { name: 'City', departments: ['US City'] },
];

// City first, so the cards must sort Campus (at risk) ahead of it
const twoTeamSummary = [
  teamSummary('City', {
    [MpdHealthStatusEnum.Yellow]: 1,
    [MpdHealthStatusEnum.Green]: 1,
  }),
  teamSummary('Campus', { [MpdHealthStatusEnum.Red]: 1 }),
];

type SummaryArgs = { departments?: string[] | null };

const summaryCalls = () =>
  mutationSpy.mock.calls
    .map(([{ operation }]) => operation)
    .filter(({ operationName }) => operationName === 'ManagedStaffTeamSummary');

let setDepartmentFn: (value: string | null) => void;
let setTeamFn: (value: string | null) => void;
const Controls: React.FC = () => {
  const { setDepartment, setTeam } = useMpdSupervisorReport();
  setDepartmentFn = setDepartment;
  setTeamFn = setTeam;
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
          ManagedStaffTeamSummary: ManagedStaffTeamSummaryQuery;
        }>
          mocks={
            {
              ManagedStaff: managedStaffMock([managedStaffMember()]),
              ManagedStaffTeams: managedStaffTeamsMock(teams),
              ManagedStaffTeamSummary:
                managedStaffTeamSummaryMock(twoTeamSummary),
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

const filterRequired = (count: number) =>
  new GraphQLError(`${count} staff are in reach`, {
    extensions: { code: 'FILTER_REQUIRED', count, filtered: false },
  });

const teamsNamed = (count: number) =>
  Array.from({ length: count }, (_, index) => `Team ${index + 1}`);

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
    expect(summaryCalls()).toHaveLength(0);
  });

  it("shows each team's status counts from the API, worst first", async () => {
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

  it('takes the counts from the API, not from the staff rows', async () => {
    const { findByRole } = renderSummary(twoTeams, {
      ManagedStaffTeamSummary: managedStaffTeamSummaryMock([
        teamSummary('Campus', { [MpdHealthStatusEnum.Red]: 3 }),
        teamSummary('City', { [MpdHealthStatusEnum.Gray]: 2 }),
      ]),
    });

    const region = await findByRole('region', { name: 'Teams' });
    expect(
      within(region).getByRole('button', { name: /Campus/ }),
    ).toHaveTextContent('At risk (3)');
    expect(
      within(region).getByRole('button', { name: /City/ }),
    ).toHaveTextContent('2 staff');
  });

  it('orders the badges like the bar, worst first, then ungraded', async () => {
    const { findByRole } = renderSummary(twoTeams, {
      ManagedStaffTeamSummary: managedStaffTeamSummaryMock([
        teamSummary('Campus', { [MpdHealthStatusEnum.Red]: 1 }),
        teamSummary('City', {
          [MpdHealthStatusEnum.Blue]: 1,
          [MpdHealthStatusEnum.Green]: 1,
          [MpdHealthStatusEnum.Yellow]: 1,
          [MpdHealthStatusEnum.Red]: 1,
        }),
      ]),
    });

    const region = await findByRole('region', { name: 'Teams' });
    const city = within(region).getByRole('button', { name: /City/ });
    expect(city).toHaveTextContent('4 staff');
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

  it("toggles the team filter from a card and keeps every team's counts", async () => {
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
    const pressed = await findByRole('button', {
      name: /Campus/,
      pressed: true,
    });
    expect(
      within(await findByRole('region', { name: 'Teams' })).getByRole(
        'button',
        { name: /City/ },
      ),
    ).toHaveTextContent('2 staff');

    userEvent.click(pressed);

    expect(
      await findByRole('button', { name: /Campus/, pressed: false }),
    ).toBeInTheDocument();
  });

  it('asks for the counts with every filter but the team', async () => {
    const { findByRole } = renderSummary();
    await findByRole('region', { name: 'Teams' });

    act(() => {
      setTeamFn('Campus');
      setDepartmentFn('US City');
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeamSummary', {
        departments: ['US City'],
      }),
    );
    for (const { variables } of summaryCalls()) {
      expect(variables).not.toHaveProperty('teamNames');
      expect(variables).not.toHaveProperty('first');
    }
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

  it('hides the cards when the counts cannot be loaded', async () => {
    const { queryByRole } = renderSummary(twoTeams, {
      ManagedStaffTeamSummary: {
        managedStaffTeamSummary: () => {
          throw new Error('Counts unavailable');
        },
      },
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeamSummary'),
    );
    await act(async () => {});
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

  it('shows every team under the row cap, however many there are', async () => {
    const names = teamsNamed(maxTeamPickerCards + 1);
    const { findByRole } = renderSummary(
      names.map((name) => ({ name, departments: ['Cohort A'] })),
      {
        ManagedStaffTeamSummary: managedStaffTeamSummaryMock(
          names.map((name) =>
            teamSummary(name, { [MpdHealthStatusEnum.Green]: 1 }),
          ),
        ),
      },
    );

    expect(
      await findByRole('button', { name: `Teams (${names.length})` }),
    ).toBeInTheDocument();
  });

  // MPDX-10301: a coordinator with 19 teams lost most of the screen to cards
  describe('with more teams than fit in two rows', () => {
    const names = Array.from(
      { length: 19 },
      (_, index) => `Team ${String.fromCharCode(65 + index)}`,
    );
    const manyTeams = names.map((name) => ({
      name,
      departments: ['Cohort A'],
    }));
    const teamSummaries = (red: string[] = []) =>
      names.map((name) =>
        teamSummary(name, {
          [red.includes(name)
            ? MpdHealthStatusEnum.Red
            : MpdHealthStatusEnum.Green]: 1,
        }),
      );
    const card = (name: string) => new RegExp(`^${name}`);
    const cardsBox = (region: HTMLElement) =>
      within(region).getByRole('button', { name: card(names[0]) })
        .parentElement as HTMLElement;

    // jsdom has no layout: one 80px card per row, 8px apart, in a 200px box
    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'offsetTop', 'get')
        .mockImplementation(function (this: HTMLElement) {
          const siblings = Array.from(this.parentElement?.children ?? []);
          return siblings.indexOf(this) * 88;
        });
      jest
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockReturnValue(80);
      jest.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(200);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('caps the counted cards at about two rows and scrolls the rest', async () => {
      const { findByRole } = renderSummary(manyTeams, {
        ManagedStaffTeamSummary: managedStaffTeamSummaryMock(teamSummaries()),
      });

      expect(
        cardsBox(await findByRole('region', { name: 'Teams' })),
      ).toHaveStyle({ maxHeight: '200px', overflowY: 'auto' });
    });

    it('caps the name-only cards at about two of their shorter rows', async () => {
      const { findByRole } = renderSummary(manyTeams, {
        ManagedStaff: {
          managedStaff: () => {
            throw filterRequired(1200);
          },
        },
        ManagedStaffTeamSummary: {
          managedStaffTeamSummary: () => {
            throw filterRequired(1200);
          },
        },
      });

      expect(
        cardsBox(await findByRole('region', { name: 'Teams' })),
      ).toHaveStyle({ maxHeight: '110px', overflowY: 'auto' });
    });

    it('scrolls a team picked from the filters into view', async () => {
      const { findByRole } = renderSummary(manyTeams, {
        ManagedStaffTeamSummary: managedStaffTeamSummaryMock(teamSummaries()),
      });
      const box = cardsBox(await findByRole('region', { name: 'Teams' }));

      act(() => {
        setTeamFn(names[18]);
      });

      // The last card's bottom edge meets the box's bottom edge
      await waitFor(() => expect(box.scrollTop).toBe(18 * 88 + 80 - 200));

      act(() => {
        setTeamFn(names[1]);
      });

      await waitFor(() => expect(box.scrollTop).toBe(88));
    });

    it('leaves the scroll alone when the picked team is already in view', async () => {
      const { findByRole } = renderSummary(manyTeams, {
        ManagedStaffTeamSummary: managedStaffTeamSummaryMock(teamSummaries()),
      });
      const box = cardsBox(await findByRole('region', { name: 'Teams' }));
      box.scrollTop = 88;

      act(() => {
        setTeamFn(names[2]);
      });

      await findByRole('button', { name: card(names[2]), pressed: true });
      await act(async () => {});
      expect(box.scrollTop).toBe(88);
    });

    it('keeps the picked team in view when new filters reorder the cards', async () => {
      const { findByRole, getByRole } = renderSummary(manyTeams, {
        ManagedStaffTeamSummary: {
          managedStaffTeamSummary: (_root: unknown, args: SummaryArgs) =>
            // Every other team turns red, so the picked one sorts last
            teamSummaries(args.departments ? names.slice(1) : []),
        },
      });
      await findByRole('region', { name: 'Teams' });
      act(() => {
        setTeamFn(names[0]);
      });
      await findByRole('button', { name: card(names[0]), pressed: true });

      act(() => {
        setDepartmentFn('Cohort A');
      });

      // The cards remount once the department's counts arrive
      await waitFor(() => {
        const box = cardsBox(getByRole('region', { name: 'Teams' }));
        expect(box.lastElementChild).toHaveAttribute('aria-pressed', 'true');
        expect(box.scrollTop).toBe(18 * 88 + 80 - 200);
      });
    });
  });

  describe('over the row cap', () => {
    const rosterOverCap: ApolloErgonoMockMap = {
      ManagedStaff: {
        managedStaff: () => {
          throw filterRequired(129);
        },
      },
    };
    const cohortTeams: ManagedStaffTeamsQuery['managedStaffTeams'] = [
      { name: 'North Team', departments: ['Cohort A'] },
      { name: 'South Team', departments: ['Cohort A'] },
      { name: 'East Team', departments: ['Cohort B'] },
    ];
    const cohortSummary: ApolloErgonoMockMap = {
      ManagedStaffTeamSummary: {
        managedStaffTeamSummary: (_root: unknown, args: SummaryArgs) =>
          [
            teamSummary('North Team', { [MpdHealthStatusEnum.Red]: 2 }),
            teamSummary('South Team', { [MpdHealthStatusEnum.Green]: 3 }),
            teamSummary('East Team', { [MpdHealthStatusEnum.Yellow]: 1 }),
          ].filter(({ name }) =>
            args.departments?.includes('Cohort B')
              ? name === 'East Team'
              : args.departments?.includes('Cohort A')
                ? name !== 'East Team'
                : true,
          ),
      },
    };

    it('shows the same status counts as under the cap', async () => {
      const { findByRole } = renderSummary(cohortTeams, {
        ...rosterOverCap,
        ...cohortSummary,
      });

      const region = await findByRole('region', { name: 'Teams' });
      expect(
        within(region).getByRole('button', { name: 'Teams (3)' }),
      ).toBeInTheDocument();
      const cards = within(region).getAllByRole('button', { pressed: false });
      expect(cards[0]).toHaveTextContent('North Team');
      expect(cards[0]).toHaveTextContent('2 staff');
      expect(cards[0]).toHaveTextContent('At risk (2)');
      expect(cards[1]).toHaveTextContent('East Team');
      expect(cards[1]).toHaveTextContent('Needs attention (1)');
      expect(cards[2]).toHaveTextContent('South Team');
      expect(cards[2]).toHaveTextContent('On track (3)');
    });

    it("offers only the picked department's teams", async () => {
      const { findByRole, getByRole } = renderSummary(cohortTeams, {
        ...rosterOverCap,
        ...cohortSummary,
      });
      await findByRole('region', { name: 'Teams' });

      act(() => {
        setDepartmentFn('Cohort A');
      });

      expect(
        await findByRole('button', { name: 'Teams (2)' }),
      ).toBeInTheDocument();
      expect(
        within(getByRole('region', { name: 'Teams' })).getByRole('button', {
          name: /South Team/,
        }),
      ).toHaveTextContent('On track (3)');
    });

    it('offers nothing when the department has one team', async () => {
      const { findByRole, queryByRole } = renderSummary(cohortTeams, {
        ...rosterOverCap,
        ...cohortSummary,
      });
      await findByRole('region', { name: 'Teams' });

      act(() => {
        setDepartmentFn('Cohort B');
      });

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeamSummary', {
          departments: ['Cohort B'],
        }),
      );
      await act(async () => {});
      expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();
    });

    describe('with more teams than the card limit', () => {
      const names = teamsNamed(maxTeamPickerCards + 1);
      const manySummary: ApolloErgonoMockMap = {
        ManagedStaffTeamSummary: {
          managedStaffTeamSummary: (_root: unknown, args: SummaryArgs) =>
            (args.departments ? names.slice(0, 3) : names).map((name) =>
              teamSummary(name, { [MpdHealthStatusEnum.Green]: 1 }),
            ),
        },
      };
      const manyTeams = names.map((name) => ({
        name,
        departments: ['Cohort A'],
      }));

      it('offers nothing until a department narrows them', async () => {
        const { findByRole, queryByRole } = renderSummary(manyTeams, {
          ...rosterOverCap,
          ...manySummary,
        });
        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation('ManagedStaffTeamSummary'),
        );
        await act(async () => {});
        expect(
          queryByRole('region', { name: 'Teams' }),
        ).not.toBeInTheDocument();

        act(() => {
          setDepartmentFn('Cohort A');
        });

        expect(
          await findByRole('button', { name: 'Teams (3)' }),
        ).toBeInTheDocument();
      });

      it('keeps the limit once a team that fits is picked', async () => {
        const { queryByRole } = renderSummary(manyTeams, {
          ManagedStaff: {
            managedStaff: (
              _root: unknown,
              args: { teamNames?: string[] | null },
            ) => {
              if (!args.teamNames) {
                throw filterRequired(129);
              }
              return managedStaffMock([managedStaffMember()]).managedStaff;
            },
          },
          ...manySummary,
        });
        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
            teamNames: null,
          }),
        );
        await act(async () => {});

        act(() => {
          setTeamFn('Team 1');
        });

        await waitFor(() =>
          expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
            teamNames: ['Team 1'],
          }),
        );
        await act(async () => {});
        expect(
          queryByRole('region', { name: 'Teams' }),
        ).not.toBeInTheDocument();
      });
    });

    it('toggles the team filter from a card', async () => {
      const { findByRole } = renderSummary(cohortTeams, {
        ...rosterOverCap,
        ...cohortSummary,
      });
      const region = await findByRole('region', { name: 'Teams' });

      userEvent.click(
        within(region).getByRole('button', { name: /North Team/ }),
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
          teamNames: ['North Team'],
        }),
      );
      const pressed = await findByRole('button', {
        name: /North Team/,
        pressed: true,
      });
      expect(pressed).toHaveTextContent('At risk (2)');

      userEvent.click(pressed);

      expect(
        await findByRole('button', { name: /North Team/, pressed: false }),
      ).toBeInTheDocument();
    });
  });

  describe('past the summary cap', () => {
    it('names the teams without counts', async () => {
      const { findByRole } = renderSummary(
        [
          { name: 'North Team', departments: ['Cohort A'] },
          { name: 'South Team', departments: ['Cohort A'] },
        ],
        {
          ManagedStaff: {
            managedStaff: () => {
              throw filterRequired(1200);
            },
          },
          ManagedStaffTeamSummary: {
            managedStaffTeamSummary: () => {
              throw filterRequired(1200);
            },
          },
        },
      );

      const region = await findByRole('region', { name: 'Teams' });
      expect(
        within(region)
          .getAllByRole('button', { pressed: false })
          .map((card) => card.textContent),
      ).toEqual(['North Team', 'South Team']);
    });

    it('keeps the names up while a new filter loads', async () => {
      let answerDepartment = () => {};
      const departmentAnswered = new Promise<void>((resolve) => {
        answerDepartment = resolve;
      });
      const { findByRole, getByRole } = renderSummary(
        [
          { name: 'North Team', departments: ['Cohort A'] },
          { name: 'South Team', departments: ['Cohort A'] },
        ],
        {
          ManagedStaff: {
            managedStaff: () => {
              throw filterRequired(1200);
            },
          },
          ManagedStaffTeamSummary: {
            managedStaffTeamSummary: async (
              _root: unknown,
              args: SummaryArgs,
            ) => {
              if (args.departments) {
                await departmentAnswered;
              }
              throw filterRequired(1200);
            },
          },
        },
      );
      await findByRole('region', { name: 'Teams' });

      act(() => {
        setDepartmentFn('Cohort A');
      });
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
          departments: ['Cohort A'],
        }),
      );
      await act(async () => {});

      // The department's summary has not answered yet
      expect(getByRole('region', { name: 'Teams' })).toBeInTheDocument();
      answerDepartment();
      expect(await findByRole('region', { name: 'Teams' })).toBeInTheDocument();
    });
  });
});
