import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
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
    const { findByText, getByText } = renderReport();

    expect(await findByText('John Smith')).toBeInTheDocument();
    expect(getByText('Alice Jones')).toBeInTheDocument();
  });

  it('surfaces a query failure instead of an empty roster', async () => {
    const { findByRole, queryByText } = renderReport({
      mocks: {
        ManagedStaff: {
          managedStaff: () => {
            throw new Error('Not authorized');
          },
        },
      },
    });

    expect(await findByRole('alert')).toHaveTextContent('Not authorized');
    expect(queryByText('No staff members found')).not.toBeInTheDocument();
  });

  it('shows the loaded count against the total the query reports', async () => {
    const { findByText } = renderReport();

    expect(
      await findByText('Showing 2 of 2 · sorted by MPD health'),
    ).toBeInTheDocument();
  });

  it('sends the search box text to the server as the name filter', async () => {
    const { findByText, getByRole } = renderReport();
    await findByText('John Smith');

    userEvent.type(getByRole('textbox', { name: 'Search name' }), 'Jones');

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        name: 'Jones',
      }),
    );
  });

  it('omits teamIds until a team is chosen', async () => {
    const { findByText } = renderReport();
    await findByText('John Smith');

    expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
      teamIds: null,
    });
  });

  it('omits both health flags while All people is selected', async () => {
    const { findByText } = renderReport({ withFilters: true });
    await findByText('John Smith');

    expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
      negativeLastMonth: null,
      negativeThreeMonths: null,
    });
  });

  it('sends negativeLastMonth when that chip is clicked', async () => {
    const { findByText, getByRole } = renderReport({ withFilters: true });
    await findByText('John Smith');

    userEvent.click(getByRole('button', { name: 'Negative last month' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: true,
        negativeThreeMonths: null,
      }),
    );
  });

  it('sends negativeThreeMonths when that chip is clicked', async () => {
    const { findByText, getByRole } = renderReport({ withFilters: true });
    await findByText('John Smith');

    userEvent.click(getByRole('button', { name: '3+ months negative' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        negativeLastMonth: null,
        negativeThreeMonths: true,
      }),
    );
  });

  it('shows the empty state when the query returns no staff', async () => {
    const { findByText, getByText } = renderReport({
      managedStaff: managedStaffMock([]),
    });

    expect(await findByText('No staff members found')).toBeInTheDocument();
    expect(
      getByText('Showing 0 of 0 · sorted by MPD health'),
    ).toBeInTheDocument();
  });

  it('labels the quarter columns from the first row', async () => {
    const { findByText, getByText } = renderReport();
    await findByText('John Smith');

    expect(getByText('FQ4 25')).toBeInTheDocument();
    expect(getByText('FQ3 26')).toBeInTheDocument();
  });

  // The card and the drawer both display the same name, so the drawer is
  // identified by its unique Close button and the "Employment Type" detail label
  // (which appears only in the user section, not the spouse section).
  it('opens the drawer when a staff member card is clicked', async () => {
    const { findAllByRole, findByRole, getByText } = renderReport();

    const cards = await findAllByRole('button', {
      name: new RegExp('View details for'),
    });
    userEvent.click(cards[0]);

    expect(await findByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(getByText('Employment Type')).toBeInTheDocument();
  });

  it('calls onFilterListToggle when the filter toggle button is clicked', async () => {
    const { findByText, getByRole } = renderReport();
    await findByText('John Smith');

    userEvent.click(getByRole('button', { name: 'Toggle Filters Panel' }));
    expect(onFilterListToggle).toHaveBeenCalledTimes(1);
  });

  it('renders with panelOpen=null (no panel open)', async () => {
    const { findByText } = renderReport({ panelOpen: null });

    expect(await findByText('John Smith')).toBeInTheDocument();
  });

  it('renders with panelOpen=Panel.Navigation', async () => {
    const { findByText } = renderReport({ panelOpen: Panel.Navigation });

    expect(await findByText('John Smith')).toBeInTheDocument();
  });
});
