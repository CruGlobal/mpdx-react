import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { MpdSupervisorReportFilterPanel } from './Filters/MpdSupervisorReportFilterPanel';
import { UpdateStaffGeographicLocationMutation } from './GeographicLocationSelect/UpdateStaffGeographicLocation.generated';
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

const geographicConstants = {
  constant: {
    mpdGoalBenefitsConstants: [{ id: 'benefits-1' }],
    mpdGoalGeographicConstants: [
      { location: 'None', percentageMultiplier: 0 },
      { location: 'Orlando, FL', percentageMultiplier: 0.06 },
      { location: 'New York, NY', percentageMultiplier: 0.12 },
    ],
    mpdGoalMiscConstants: [],
  },
};

const managedStaffOperations = () =>
  mutationSpy.mock.calls
    .map(([{ operation }]) => operation)
    .filter(({ operationName }) => operationName === 'ManagedStaff');

const staff = [
  managedStaffMember(),
  managedStaffMember({
    firstName: 'Alice',
    lastName: 'Jones',
    personNumber: '10000003',
    staffAccountId: '1000000003',
  }),
];

// The API's row cap, as the schema's rescue_from reports it
const filterGuard = (filtered: boolean): ApolloErgonoMockMap => ({
  ManagedStaff: {
    managedStaff: () => {
      throw new GraphQLError('228 staff are in reach', {
        extensions: { code: 'FILTER_REQUIRED', count: 228, filtered },
      });
    },
  },
});

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
        <SnackbarProvider>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 800, itemHeight: 80 }}
          >
            <GqlMockedProvider<{
              ManagedStaff: ManagedStaffQuery;
              ManagedStaffTeams: ManagedStaffTeamsQuery;
              GoalCalculatorConstants: GoalCalculatorConstantsQuery;
              UpdateStaffGeographicLocation: UpdateStaffGeographicLocationMutation;
            }>
              mocks={
                {
                  ManagedStaff: managedStaff,
                  ManagedStaffTeams: managedStaffTeamsMock(),
                  GoalCalculatorConstants: geographicConstants,
                  UpdateStaffGeographicLocation: {
                    updateManagedStaffGeographicLocation: {
                      geographicLocation: 'New York, NY',
                      newStaffMonthlySalary: 3000,
                    },
                  },
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
        </SnackbarProvider>
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

  it('retries the query from the error state', async () => {
    const { findByRole } = renderReport({
      mocks: {
        ManagedStaff: {
          managedStaff: () => {
            throw new Error('Not authorized');
          },
        },
      },
    });
    const retry = await findByRole('button', { name: 'Retry' });
    const callsBefore = managedStaffOperations().length;

    userEvent.click(retry);

    await waitFor(() =>
      expect(managedStaffOperations().length).toBeGreaterThan(callsBefore),
    );
  });

  describe('filter guard', () => {
    it('explains the row cap instead of showing an error', async () => {
      const { findByRole, queryByRole, queryByText } = renderReport({
        mocks: filterGuard(false),
      });

      expect(
        await findByRole('heading', {
          name: 'You supervise 228 staff — too many to list at once.',
        }),
      ).toBeInTheDocument();
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(queryByText(/Showing 0 of 0/)).not.toBeInTheDocument();
    });

    it('asks for another filter when the report is already narrowed', async () => {
      const { findByRole } = renderReport({ mocks: filterGuard(true) });

      expect(
        await findByRole('heading', {
          name: '228 staff match — still too many to list at once.',
        }),
      ).toBeInTheDocument();
    });

    it('offers to open the filters while the panel is closed', async () => {
      const { findByRole } = renderReport({
        mocks: filterGuard(false),
        panelOpen: null,
      });

      userEvent.click(await findByRole('button', { name: 'Open filters' }));

      expect(onFilterListToggle).toHaveBeenCalledTimes(1);
    });

    it('does not offer to open the filters while the panel is open', async () => {
      const { findByRole, queryByRole } = renderReport({
        mocks: filterGuard(false),
        panelOpen: Panel.Filters,
      });
      await findByRole('heading', { name: /too many to list at once/ });

      expect(
        queryByRole('button', { name: 'Open filters' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('applied filters', () => {
    it('lists active filters as chips and removes one', async () => {
      const { findByText, getByRole, queryByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');
      expect(
        queryByRole('list', { name: 'Applied filters' }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Negative last month' }));
      const chips = getByRole('list', { name: 'Applied filters' });
      expect(chips).toHaveTextContent('Negative last month');

      // The chip itself is the remove button, so it is one keyboard stop
      userEvent.click(
        within(chips).getByRole('button', {
          name: 'Remove Negative last month',
        }),
      );
      expect(
        queryByRole('list', { name: 'Applied filters' }),
      ).not.toBeInTheDocument();
    });

    it('removes a chip from the keyboard', async () => {
      const { findByText, getByRole, queryByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');
      userEvent.click(getByRole('button', { name: 'Negative last month' }));
      const chip = within(
        getByRole('list', { name: 'Applied filters' }),
      ).getByRole('button', { name: 'Remove Negative last month' });

      userEvent.type(chip, '{del}');

      expect(
        queryByRole('list', { name: 'Applied filters' }),
      ).not.toBeInTheDocument();
    });

    it('labels a chosen employment type', async () => {
      const { findByText, getByRole, findByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');

      userEvent.click(getByRole('combobox', { name: 'Employment type' }));
      userEvent.click(await findByRole('option', { name: 'Part time' }));

      expect(getByRole('list', { name: 'Applied filters' })).toHaveTextContent(
        'Employment type: Part time',
      );
    });

    it('clears every filter and the search from the chip row', async () => {
      const { findByText, getByRole, queryByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');
      userEvent.type(getByRole('textbox', { name: 'Search name' }), 'Jo');
      userEvent.click(getByRole('button', { name: 'Negative last month' }));

      userEvent.click(getByRole('button', { name: 'Clear all' }));

      expect(
        queryByRole('list', { name: 'Applied filters' }),
      ).not.toBeInTheDocument();
      expect(getByRole('textbox', { name: 'Search name' })).toHaveValue('');
    });

    it('badges the filter button with the active filter count', async () => {
      const { findByText, getByRole } = renderReport({ withFilters: true });
      await findByText('John Smith');
      const toggle = getByRole('button', { name: 'Toggle Filters Panel' });
      expect(toggle).not.toHaveTextContent('1');

      userEvent.click(getByRole('button', { name: 'Negative last month' }));

      expect(toggle).toHaveTextContent('1');
    });

    it('offers to clear filters when they exclude everyone', async () => {
      const { findByText, getByRole } = renderReport({
        managedStaff: managedStaffMock([]),
        withFilters: true,
      });
      await findByText('No staff members found');

      userEvent.click(getByRole('button', { name: 'Negative last month' }));
      expect(
        await findByText('No staff match your filters'),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Clear filters' }));
      expect(await findByText('No staff members found')).toBeInTheDocument();
    });
  });

  it('keeps the rows and offers Retry when a later page fails', async () => {
    const firstPage = managedStaffMock(staff);
    firstPage.managedStaff.pageInfo = {
      endCursor: 'cursor-1',
      hasNextPage: true,
    };
    const { findByText, findByRole, getByText, getByRole } = renderReport({
      mocks: {
        ManagedStaff: {
          managedStaff: (_root: unknown, args: { after?: string | null }) => {
            if (args.after) {
              throw new Error('Page failed');
            }
            return firstPage.managedStaff;
          },
        },
      },
    });
    await findByText('John Smith');
    const pageRequests = () =>
      managedStaffOperations().filter(
        ({ variables }) => variables.after === 'cursor-1',
      );

    // The context asks for the rest of the result by itself
    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent('Could not load more staff: Page failed');
    expect(getByText('John Smith')).toBeInTheDocument();
    // The mocked list can also reach its end on a re-render; let any such
    // request finish so Apollo does not deduplicate the retry against it
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const requestsBeforeRetry = pageRequests().length;
    expect(requestsBeforeRetry).toBeGreaterThanOrEqual(1);

    userEvent.click(getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(pageRequests().length).toBeGreaterThan(requestsBeforeRetry),
    );
  });

  it('counts people, not rows, when a spouse pair is merged', async () => {
    const john = managedStaffMember({
      personNumber: '1',
      spousePersonNumber: '2',
    });
    const jane = managedStaffMember({
      firstName: 'Jane',
      personNumber: '2',
      spousePersonNumber: '1',
    });
    const { findByText, queryByText } = renderReport({
      managedStaff: managedStaffMock([john, jane]),
    });

    expect(await findByText('John & Jane Smith')).toBeInTheDocument();
    expect(queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(
      await findByText('Showing 2 of 2 · sorted by MPD health'),
    ).toBeInTheDocument();
  });

  it('opens and closes a quick glance from the row chevron', async () => {
    const { findByRole, getByRole, queryByTestId, getByTestId } =
      renderReport();
    const chevron = await findByRole('button', {
      name: 'Show details for John Smith',
    });
    expect(queryByTestId('quick-glance')).not.toBeInTheDocument();

    userEvent.click(chevron);

    expect(getByTestId('quick-glance')).toHaveTextContent('Tenure');
    userEvent.click(
      getByRole('button', { name: 'Hide details for John Smith' }),
    );
    await waitFor(() =>
      expect(queryByTestId('quick-glance')).not.toBeInTheDocument(),
    );
  });

  it('hides the team summary while the filter guard is showing', async () => {
    const { findByRole, queryByRole } = renderReport({
      mocks: filterGuard(false),
    });
    await findByRole('heading', { name: /too many to list at once/ });

    expect(queryByRole('region', { name: 'Teams' })).not.toBeInTheDocument();
  });

  it('shows the team summary for a supervisor with several teams', async () => {
    const { findByRole } = renderReport();

    const region = await findByRole('region', { name: 'Teams' });
    expect(
      within(region).getByRole('button', { name: /Campus/ }),
    ).toHaveTextContent('2 staff');
  });

  it('switches the rows to the compact layout', async () => {
    const { findByText, getByRole, queryByText } = renderReport();
    await findByText('John Smith');
    // Comfortable rows show avatar initials
    expect(queryByText('JS')).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Compact rows' }));

    expect(queryByText('JS')).not.toBeInTheDocument();
    expect(getByRole('button', { name: 'Compact rows' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
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

  it('refetches the roster with the active filter after a location is saved', async () => {
    const { findByText, findByRole, getByRole } = renderReport();
    await findByText('John Smith');

    userEvent.type(getByRole('textbox', { name: 'Search name' }), 'Smith');
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {
        name: 'Smith',
      }),
    );
    const callsBeforeSave = managedStaffOperations().length;

    userEvent.click(await findByText('John Smith'));
    const location = await findByRole('combobox', {
      name: 'Geographic Location',
    });
    await waitFor(() => expect(location).not.toBeDisabled());
    userEvent.type(location, 'New York');
    userEvent.click(await findByRole('option', { name: 'New York, NY (12%)' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(managedStaffOperations().length).toBeGreaterThan(callsBeforeSave),
    );
    expect(managedStaffOperations().at(-1)?.variables).toMatchObject({
      name: 'Smith',
    });
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

  it('orders the quarter columns newest first', async () => {
    const { findByText, getAllByText } = renderReport();
    await findByText('John Smith');

    const headers = getAllByText(/^FQ\d \d\d$/).map((el) => el.textContent);
    expect(headers).toEqual(['FQ3 26', 'FQ2 26', 'FQ1 26', 'FQ4 25']);
  });

  it('shows the chip color key beside the quarter columns', async () => {
    const { findByText, getByRole, queryByRole } = renderReport();
    // The key only makes sense once there are chips to decode
    expect(
      queryByRole('list', { name: 'Chip colors' }),
    ).not.toBeInTheDocument();
    await findByText('John Smith');

    const key = getByRole('list', { name: 'Chip colors' });
    expect(key).toHaveTextContent('On track');
    expect(key).toHaveTextContent('Needs attention');
    expect(key).toHaveTextContent('At risk');
    expect(key).toHaveTextContent('No data');
  });

  it('renders the How this report works button in the header', async () => {
    const { findByRole } = renderReport();

    // Opening the legend is covered by ReportLegendPanel.test.tsx
    expect(
      await findByRole('button', { name: 'How this report works' }),
    ).toBeInTheDocument();
  });

  it('explains a fiscal quarter header on hover', async () => {
    const { findByText, findByRole } = renderReport();
    const header = await findByText('FQ1 26');
    // The tooltip describes the header rather than replacing its label
    expect(header).not.toHaveAttribute('aria-label');

    userEvent.hover(header);

    expect(await findByRole('tooltip')).toHaveTextContent(
      'Fiscal quarter 1, FY26: Sep 2025 – Nov 2025',
    );
  });

  it('explains a fiscal quarter header on keyboard focus', async () => {
    // jsdom has no :focus-visible, so MUI's Tooltip would never open on focus.
    // Treat the focused element as focus-visible, as a browser does for keyboard focus.
    const matches = Element.prototype.matches;
    const matchesSpy = jest
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':focus-visible'
          ? this === document.activeElement
          : matches.call(this, selector);
      });
    try {
      const { findByText, findByRole } = renderReport();
      const header = await findByText('FQ4 25');

      act(() => header.focus());

      expect(await findByRole('tooltip')).toHaveTextContent(
        'Fiscal quarter 4, FY25: Jun 2025 – Aug 2025',
      );
    } finally {
      matchesSpy.mockRestore();
    }
  });

  it('marks the starting quarter header as partial', async () => {
    const baseHealth = managedStaffMember().quarterlyHealth;
    const newStaff = managedStaffMember({
      quarterlyHealth: {
        ...baseHealth,
        startingQuarter: {
          fiscalYear: 2025,
          quarter: 3,
          months: [
            {
              month: '2025-05',
              payroll: 3000,
              status: MpdHealthStatusEnum.Green,
            },
          ],
        },
      },
    });
    const { findByText, findByRole } = renderReport({
      managedStaff: managedStaffMock([newStaff]),
    });

    userEvent.hover(await findByText('FQ3 25'));

    expect(await findByRole('tooltip')).toHaveTextContent(
      'Fiscal quarter 3, FY25: Mar 2025 – May 2025 Partial quarter: payroll started during this quarter.',
    );
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
