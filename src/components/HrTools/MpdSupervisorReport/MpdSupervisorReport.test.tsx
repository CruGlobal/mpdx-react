import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdSupervisorReportFilterPanel } from './Filters/MpdSupervisorReportFilterPanel';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import { ManagedStaffTeamsQuery } from './ManagedStaffTeams.generated';
import { MpdSupervisorReport } from './MpdSupervisorReport';
import {
  MpdSupervisorReportProvider,
  Panel,
} from './MpdSupervisorReportContext';
import { StaffMemberDrawer } from './StaffMemberDrawer/StaffMemberDrawer';
import {
  managedStaffMember,
  managedStaffMock,
  managedStaffTeamsMock,
} from './mpdSupervisorReportMocks';

const onNavListToggle = jest.fn();
const onFilterListToggle = jest.fn();
const mutationSpy = jest.fn();

const staff = [
  managedStaffMember(),
  managedStaffMember({
    firstName: 'Alice',
    lastName: 'Jones',
    personNumber: '10000003',
    staffAccountId: '1000000003',
  }),
];

interface RenderOptions {
  panelOpen?: Panel | null;
  managedStaff?: ManagedStaffQuery;
  /** Renders the filter panel too, so a chip click can drive the query. */
  withFilters?: boolean;
  /** Overrides the default mocks, e.g. to make an operation throw. */
  mocks?: ApolloErgonoMockMap;
}

const renderReport = ({
  panelOpen = Panel.Filters,
  managedStaff = managedStaffMock(staff),
  withFilters = false,
  mocks = {},
}: RenderOptions = {}) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 800, itemHeight: 80 }}
        >
          <GqlMockedProvider<{
            ManagedStaff: ManagedStaffQuery;
            ManagedStaffTeams: ManagedStaffTeamsQuery;
          }>
            mocks={
              {
                ManagedStaff: managedStaff,
                ManagedStaffTeams: managedStaffTeamsMock(),
                ...mocks,
              } as ApolloErgonoMockMap
            }
            onCall={mutationSpy}
          >
            <MpdSupervisorReportProvider>
              <MpdSupervisorReport
                panelOpen={panelOpen}
                onNavListToggle={onNavListToggle}
                onFilterListToggle={onFilterListToggle}
                title="MPD Supervisor Report"
              />
              {withFilters && (
                <MpdSupervisorReportFilterPanel onClose={jest.fn()} />
              )}
              <StaffMemberDrawer />
            </MpdSupervisorReportProvider>
          </GqlMockedProvider>
        </VirtuosoMockContext.Provider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('MpdSupervisorReport', () => {
  it('renders a row per staff member the query returns', async () => {
    renderReport();

    expect(await screen.findByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Jones')).toBeInTheDocument();
  });

  it('surfaces a query failure instead of an empty roster', async () => {
    renderReport({
      mocks: {
        ManagedStaff: {
          managedStaff: () => {
            throw new Error('Not authorized');
          },
        },
      },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Not authorized',
    );
    expect(
      screen.queryByText('No staff members found'),
    ).not.toBeInTheDocument();
  });

  it('shows the loaded count against the total the query reports', async () => {
    renderReport();

    expect(
      await screen.findByText('Showing 2 of 2 · sorted by MPD health'),
    ).toBeInTheDocument();
  });

  it('sends the search box text to the server as the name filter', async () => {
    renderReport();
    await screen.findByText('John Smith');

    userEvent.type(
      screen.getByRole('textbox', { name: 'Search name' }),
      'Jones',
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        name: 'Jones',
      }),
    );
  });

  it('omits teamIds until a team is chosen', async () => {
    renderReport();
    await screen.findByText('John Smith');

    expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
      teamIds: null,
    });
  });

  it('omits both health flags while All people is selected', async () => {
    renderReport({ withFilters: true });
    await screen.findByText('John Smith');

    expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
      negativeLastMonth: null,
      negativeThreeMonths: null,
    });
  });

  it('sends negativeLastMonth when that chip is clicked', async () => {
    renderReport({ withFilters: true });
    await screen.findByText('John Smith');

    userEvent.click(
      screen.getByRole('button', { name: 'Negative last month' }),
    );

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: true,
        negativeThreeMonths: null,
      }),
    );
  });

  it('sends negativeThreeMonths when that chip is clicked', async () => {
    renderReport({ withFilters: true });
    await screen.findByText('John Smith');

    userEvent.click(screen.getByRole('button', { name: '3+ months negative' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: null,
        negativeThreeMonths: true,
      }),
    );
  });

  it('shows the empty state when the query returns no staff', async () => {
    renderReport({ managedStaff: managedStaffMock([]) });

    expect(
      await screen.findByText('No staff members found'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Showing 0 of 0 · sorted by MPD health'),
    ).toBeInTheDocument();
  });

  it('labels the quarter columns from the first row', async () => {
    renderReport();
    await screen.findByText('John Smith');

    expect(screen.getByText('FQ4 25')).toBeInTheDocument();
    expect(screen.getByText('FQ3 26')).toBeInTheDocument();
  });

  // The card and the drawer both display the same name, so the drawer is
  // identified by its unique Close button and the "Employment Type" detail label
  // (which appears only in the user section, not the spouse section).
  it('opens the drawer when a staff member card is clicked', async () => {
    renderReport();

    const cards = await screen.findAllByRole('button', {
      name: new RegExp('View details for'),
    });
    userEvent.click(cards[0]);

    expect(
      await screen.findByRole('button', { name: 'Close' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Employment Type')).toBeInTheDocument();
  });

  it('calls onFilterListToggle when the filter toggle button is clicked', async () => {
    renderReport();
    await screen.findByText('John Smith');

    userEvent.click(
      screen.getByRole('button', { name: 'Toggle Filters Panel' }),
    );
    expect(onFilterListToggle).toHaveBeenCalledTimes(1);
  });

  it('renders with panelOpen=null (no panel open)', async () => {
    renderReport({ panelOpen: null });

    expect(await screen.findByText('John Smith')).toBeInTheDocument();
  });

  it('renders with panelOpen=Panel.Navigation', async () => {
    renderReport({ panelOpen: Panel.Navigation });

    expect(await screen.findByText('John Smith')).toBeInTheDocument();
  });
});
