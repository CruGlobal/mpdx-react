import React from 'react';
import { DefaultOptions } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { MpdSupervisorReportFilterPanel } from './Filters/MpdSupervisorReportFilterPanel';
import { UpdateStaffGeographicLocationMutation } from './GeographicLocationSelect/UpdateStaffGeographicLocation.generated';
import { ManagedStaffQuery } from './ManagedStaff.generated';
import { ManagedStaffTeamSummaryQuery } from './ManagedStaffTeamSummary.generated';
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
  managedStaffTeamSummaryMock,
  managedStaffTeamsMock,
  teamSummary,
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
  defaultOptions?: DefaultOptions;
}

const renderReport = ({
  panelOpen = Panel.Filters,
  managedStaff = managedStaffMock(staff),
  withFilters = false,
  mocks = {},
  defaultOptions,
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
              ManagedStaffTeamSummary: ManagedStaffTeamSummaryQuery;
              GoalCalculatorConstants: GoalCalculatorConstantsQuery;
              UpdateStaffGeographicLocation: UpdateStaffGeographicLocationMutation;
            }>
              mocks={
                {
                  ManagedStaff: managedStaff,
                  ManagedStaffTeams: managedStaffTeamsMock(),
                  ManagedStaffTeamSummary: managedStaffTeamSummaryMock([
                    teamSummary('Campus', { [MpdHealthStatusEnum.Green]: 2 }),
                    teamSummary('Central Team', {
                      [MpdHealthStatusEnum.Red]: 1,
                    }),
                  ]),
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
              defaultOptions={defaultOptions}
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

// The box that actually lays an element out, skipping display: contents wrappers
const layoutParentAtWidth = (element: Element, width: number): Element => {
  let parent = element.parentElement;
  while (parent && getStyleAtWidth(parent, 'display', width) === 'contents') {
    parent = parent.parentElement;
  }
  if (!parent) {
    throw new Error('Element has no layout parent');
  }
  return parent;
};

// jsdom keeps the flex shorthand as written, so read the grow factor from either
const flexGrowAtWidth = (element: Element, width: number): number => {
  const grow = getStyleAtWidth(element, 'flex-grow', width);
  if (grow) {
    return Number(grow);
  }
  const flex = getStyleAtWidth(element, 'flex', width);
  return flex === 'auto' ? 1 : Number.parseFloat(flex) || 0;
};

// Whether the element or any wrapper up to the header is display: none
const isHiddenAtWidth = (
  element: Element,
  header: Element,
  width: number,
): boolean => {
  let current: Element | null = element;
  while (current && current !== header) {
    if (getStyleAtWidth(current, 'display', width) === 'none') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

// Works out each var(--name, fallback) the way the page would, from the
// values set on the root element
const resolveCssVariables = (value: string): string =>
  value.replace(
    /var\((--[\w-]+),\s*([^)]+)\)/g,
    (_match, name: string, fallback: string) =>
      document.documentElement.style.getPropertyValue(name).trim() ||
      fallback.trim(),
  );

// A font size in px, from either the rem the theme uses or a px value
const fontSizePxAtWidth = (element: Element, width: number): number => {
  const fontSize = getStyleAtWidth(element, 'font-size', width);
  const size = Number.parseFloat(fontSize);
  return fontSize.endsWith('rem') ? size * theme.typography.htmlFontSize : size;
};

// What decides where a button's icon sits inside it
const buttonBoxAtWidth = (button: Element, width: number) => ({
  display: getStyleAtWidth(button, 'display', width),
  alignItems: getStyleAtWidth(button, 'align-items', width),
  justifyContent: getStyleAtWidth(button, 'justify-content', width),
  width: getStyleAtWidth(button, 'width', width),
  height: getStyleAtWidth(button, 'height', width),
});

// The ticket's case: a supervisor with no staff, so "No staff members found"
// sits right under the header
const renderEmptyReportHeader = async () => {
  const { findByText, getByTestId } = renderReport({
    managedStaff: managedStaffMock([]),
  });
  const emptyState = await findByText('No staff members found');
  const header = getByTestId('MultiPageHeader');
  const { getByRole } = within(header);

  const searchField = getByRole('textbox', { name: 'Search name' }).closest(
    '.MuiTextField-root',
  );
  if (!searchField) {
    throw new Error('Search field not found');
  }

  // The header's sibling that holds the empty state
  let listArea: Element = emptyState;
  while (listArea.parentElement && !listArea.parentElement.contains(header)) {
    listArea = listArea.parentElement;
  }
  if (!listArea.parentElement) {
    throw new Error('List area not found beside the header');
  }

  return {
    header,
    emptyState,
    listArea,
    // In reading order
    controls: {
      menuButton: getByRole('button', { name: 'Toggle HR Tools Menu' }),
      filterButton: getByRole('button', { name: 'Toggle Filters Panel' }),
      title: getByRole('heading', { name: 'MPD Supervisor Report' }),
      legendButton: getByRole('button', { name: 'How this report works' }),
      densityToggle: getByRole('group', { name: 'Row density' }),
      searchField,
    },
  };
};

// Rows also label their months (shown below md), so match only the headers
const monthHeader = { selector: '[data-testid="month-headers"] p' };

jest.setTimeout(15000);

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

    it('keeps the message and shows progress while a new filter loads', async () => {
      const { findByRole, getByRole, queryByRole } = renderReport({
        mocks: filterGuard(false),
        withFilters: true,
      });
      await findByRole('heading', { name: /too many to list at once/ });

      userEvent.click(getByRole('combobox', { name: 'Person type' }));
      userEvent.click(await findByRole('option', { name: 'Employee - Staff' }));

      expect(
        getByRole('progressbar', { name: 'Refreshing staff' }),
      ).toBeInTheDocument();
      expect(
        getByRole('heading', { name: /too many to list at once/ }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(
          queryByRole('progressbar', { name: 'Refreshing staff' }),
        ).not.toBeInTheDocument(),
      );
    });

    it('loads the team summary with the list once a filter fits', async () => {
      const { findByRole, getByRole, queryByRole } = renderReport({
        withFilters: true,
        // The app's defaults, which send a request even for a cached query
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'cache-and-network',
            notifyOnNetworkStatusChange: true,
          },
        },
        mocks: {
          ManagedStaff: {
            managedStaff: (
              _root: unknown,
              args: { userPersonTypes?: string[] | null },
            ) => {
              if (!args.userPersonTypes) {
                throw new GraphQLError('228 staff are in reach', {
                  extensions: {
                    code: 'FILTER_REQUIRED',
                    count: 228,
                    filtered: false,
                  },
                });
              }
              return managedStaffMock(staff).managedStaff;
            },
          },
        },
      });
      await findByRole('heading', { name: /too many to list at once/ });

      userEvent.click(getByRole('combobox', { name: 'Person type' }));
      userEvent.click(await findByRole('option', { name: 'Employee - Staff' }));

      // The cards keep counting the staff once the list fits
      expect(await findByRole('button', { name: /Campus/ })).toHaveTextContent(
        '2 staff',
      );
      expect(
        queryByRole('heading', { name: /too many to list at once/ }),
      ).not.toBeInTheDocument();
      await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
      // The cards count through their own query, so the list is asked for once
      expect(
        managedStaffOperations().filter(
          ({ variables }) => variables.userPersonTypes,
        ),
      ).toHaveLength(1);
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

    it('lists each checked person type as its own chip', async () => {
      const { findByText, getByRole, findByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');

      userEvent.click(getByRole('combobox', { name: 'Person type' }));
      userEvent.click(await findByRole('option', { name: 'Employee - Staff' }));
      userEvent.click(getByRole('option', { name: 'Pending - Staff' }));
      const chips = getByRole('list', { name: 'Applied filters' });
      expect(chips).toHaveTextContent('Person type: Employee - Staff');
      expect(chips).toHaveTextContent('Person type: Pending - Staff');

      userEvent.click(
        within(chips).getByRole('button', {
          name: 'Remove Person type: Employee - Staff',
        }),
      );

      expect(chips).not.toHaveTextContent('Person type: Employee - Staff');
      expect(chips).toHaveTextContent('Person type: Pending - Staff');
    });

    it('shows a fully checked group as one chip that removes only that group', async () => {
      const { findByText, getByRole, findByRole } = renderReport({
        withFilters: true,
      });
      await findByText('John Smith');

      userEvent.click(getByRole('combobox', { name: 'Person type' }));
      userEvent.click(await findByRole('option', { name: 'Employee - Staff' }));
      userEvent.click(getByRole('option', { name: 'Select all Pending' }));
      const chips = getByRole('list', { name: 'Applied filters' });
      expect(chips).toHaveTextContent('Person type: Pending - All');
      expect(chips).not.toHaveTextContent('Person type: Pending - Staff');

      userEvent.click(
        within(chips).getByRole('button', {
          name: 'Remove Person type: Pending - All',
        }),
      );

      expect(chips).not.toHaveTextContent('Pending');
      expect(chips).toHaveTextContent('Person type: Employee - Staff');
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

  it('waits for every page before showing the rows', async () => {
    const firstPage = managedStaffMock(staff);
    firstPage.managedStaff.pageInfo = {
      endCursor: 'cursor-1',
      hasNextPage: true,
    };
    const { getByTestId, queryByText } = renderReport({
      mocks: {
        ManagedStaff: {
          managedStaff: (_root: unknown, args: { after?: string | null }) =>
            args.after ? new Promise(() => {}) : firstPage.managedStaff,
        },
      },
    });

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('ManagedStaff', {}),
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    expect(getByTestId('infinite-list-skeleton-loading')).toBeInTheDocument();
    expect(queryByText('John Smith')).not.toBeInTheDocument();
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
    // The couple shares a row, so the header says so
    expect(
      await findByText('Showing 2 of 2 in one row · sorted by lowest balance'),
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

  it('offers the teams with their counts above the filter guard', async () => {
    const { findByRole, getByRole, getByText } = renderReport({
      mocks: filterGuard(false),
    });
    await findByRole('heading', { name: /too many to list at once/ });

    const region = await findByRole('region', { name: 'Teams' });
    expect(
      within(region).getByRole('button', { name: 'Teams (2)' }),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole('button', { name: /Central Team/ }),
    ).toHaveTextContent('Below $0 (1)');
    expect(
      getByText(
        'Pick a team above to list its staff, or use the filters to narrow the list.',
      ),
    ).toBeInTheDocument();
    // The picker comes before the message
    expect(
      region.compareDocumentPosition(
        getByRole('heading', { name: /too many to list at once/ }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('keeps the filter hint when there are no teams to pick from', async () => {
    const { findByText, queryByRole } = renderReport({
      mocks: {
        ...filterGuard(false),
        ManagedStaffTeams: managedStaffTeamsMock([
          { name: 'Central Team', departments: ['US Technology'] },
        ]),
      },
    });

    expect(
      await findByText(
        'Search by name, or pick a team, department, employment type, person type or one of the Negative, Spending, New Staff salary or health filters.',
      ),
    ).toBeInTheDocument();
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
      await findByText('Showing 2 of 2 · sorted by lowest balance'),
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
    // Click, don't type: typing re-positions the popup per keystroke and times out
    userEvent.click(location);
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
      getByText('Showing 0 of 0 · sorted by lowest balance'),
    ).toBeInTheDocument();
  });

  it('labels the month columns from the first row, newest first', async () => {
    const { findByText, getAllByText } = renderReport();
    await findByText('John Smith');

    const headers = getAllByText(/^\w{3} \d{4}$/, monthHeader).map(
      (el) => el.textContent,
    );
    expect(headers).toEqual(['Oct 2026', 'Sep 2026', 'Aug 2026', 'Jul 2026']);
  });

  it('shows the balance color key beside the month columns', async () => {
    const { findByText, getByRole, queryByRole } = renderReport();
    // The key only makes sense once there are chips to decode
    expect(
      queryByRole('list', { name: 'Chip colors' }),
    ).not.toBeInTheDocument();
    await findByText('John Smith');

    const key = getByRole('list', { name: 'Chip colors' });
    expect(key).toHaveTextContent('At or above buffer');
    expect(key).toHaveTextContent('Below buffer');
    expect(key).toHaveTextContent('Below $0');
    expect(key).toHaveTextContent('No data');
    expect(key).not.toHaveTextContent('Below New Staff salary');
  });

  it('labels the How this report works button in the header', async () => {
    const { findByRole } = renderReport();

    // Opening the legend is covered by ReportLegendPanel.test.tsx
    expect(
      await findByRole('button', { name: 'How this report works' }),
    ).toHaveTextContent('How this report works');
  });

  it('explains a month header on hover', async () => {
    const { findByText, findByRole } = renderReport();
    const header = await findByText('Oct 2026', monthHeader);
    // The tooltip describes the header rather than replacing its label
    expect(header).not.toHaveAttribute('aria-label');

    userEvent.hover(header);

    expect(await findByRole('tooltip')).toHaveTextContent(
      'Staff account balance at the end of October 2026',
    );
  });

  it('explains a month header on keyboard focus', async () => {
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
      const header = await findByText('Jul 2026', monthHeader);

      act(() => header.focus());

      expect(await findByRole('tooltip')).toHaveTextContent(
        'Staff account balance at the end of July 2026',
      );
    } finally {
      matchesSpy.mockRestore();
    }
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

  // jsdom can't measure layout, so these read the CSS that applies at each width
  describe('header layout', () => {
    it('shows the title and controls in reading order above the list', async () => {
      const { header, emptyState, controls } = await renderEmptyReportHeader();

      const everything = Array.from(header.querySelectorAll('*'));
      const positions = Object.values(controls).map((control) =>
        everything.indexOf(control),
      );
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(header).not.toContainElement(emptyState);
      expect(header.compareDocumentPosition(emptyState)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });

    it('keeps the title and every control showing, in order, on phones', async () => {
      const { header, controls } = await renderEmptyReportHeader();

      const hidden = Object.entries(controls)
        .filter(([, control]) => isHiddenAtWidth(control, header, phoneWidth))
        .map(([name]) => name);
      expect(hidden).toEqual([]);
      // Without a CSS order the controls wrap in reading order
      const reordered = Object.entries(controls)
        .filter(([, control]) => getStyleAtWidth(control, 'order', phoneWidth))
        .map(([name]) => name);
      expect(reordered).toEqual([]);
    });

    it('lets the header grow on phones so a wrapped title stays off the list', async () => {
      const { header } = await renderEmptyReportHeader();

      // An unset height falls back to auto
      expect(getStyleAtWidth(header, 'height', phoneWidth) || 'auto').toBe(
        'auto',
      );
    });

    it.each([900, desktopWidth])(
      'keeps at least the standard header height at %ipx wide, growing when wrapped',
      async (width) => {
        const { header } = await renderEmptyReportHeader();

        expect(getStyleAtWidth(header, 'height', width)).toBe('auto');
        // Never shorter than the shared header's standard one-row 80px
        expect(
          resolveCssVariables(getStyleAtWidth(header, 'min-height', width)),
        ).toBe('80px');
      },
    );

    it('wraps the title and legend button as their own items of the header row on phones', async () => {
      const { controls } = await renderEmptyReportHeader();

      const headerRow = layoutParentAtWidth(controls.searchField, phoneWidth);
      expect(getStyleAtWidth(headerRow, 'display', phoneWidth)).toBe('flex');
      expect(getStyleAtWidth(headerRow, 'flex-wrap', phoneWidth)).toBe('wrap');
      const lockedInOwnRow = Object.entries(controls)
        .filter(
          ([, control]) =>
            layoutParentAtWidth(control, phoneWidth) !== headerRow,
        )
        .map(([name]) => name);
      expect(lockedInOwnRow).toEqual([]);
    });

    it.each([600, desktopWidth])(
      'keeps the title and legend button side by side at %ipx wide',
      async (width) => {
        const { controls } = await renderEmptyReportHeader();

        const titleRow = layoutParentAtWidth(controls.title, width);
        expect(getStyleAtWidth(titleRow, 'display', width)).toBe('flex');
        expect(layoutParentAtWidth(controls.legendButton, width)).toBe(
          titleRow,
        );
        expect(layoutParentAtWidth(controls.searchField, width)).not.toBe(
          titleRow,
        );
      },
    );

    it.each([phoneWidth, desktopWidth])(
      'stacks the header above the list in one column at %ipx wide',
      async (width) => {
        const { header, listArea } = await renderEmptyReportHeader();

        const column = layoutParentAtWidth(header, width);
        expect(layoutParentAtWidth(listArea, width)).toBe(column);
        expect(getStyleAtWidth(column, 'display', width)).toBe('flex');
        expect(getStyleAtWidth(column, 'flex-direction', width)).toBe('column');
        // The page still fills the screen under the nav bar
        expect(getStyleAtWidth(column, 'height', width)).toBe(
          `calc(100vh - ${navBarHeight})`,
        );
        // A taller header keeps its height instead of squeezing over the list
        expect(getStyleAtWidth(header, 'flex-shrink', width)).toBe('0');
      },
    );

    it.each([phoneWidth, desktopWidth])(
      'gives the list the space left under the header at %ipx wide',
      async (width) => {
        const { listArea } = await renderEmptyReportHeader();

        // A height that subtracts a fixed header leaves a taller header
        // overflowing the page
        expect(getStyleAtWidth(listArea, 'height', width)).not.toContain(
          multiPageHeaderHeight,
        );
        expect(flexGrowAtWidth(listArea, width)).toBeGreaterThan(0);
        // Lets the list shrink to that space so it scrolls inside it
        expect(getStyleAtWidth(listArea, 'min-height', width)).toBe('0');
      },
    );

    it('centers the icon the same way in both menu buttons on phones', async () => {
      const { header, controls } = await renderEmptyReportHeader();
      const { menuButton, filterButton } = controls;

      // Inline-block buttons place their icons by the text baseline, which
      // drops the badge-wrapped filter icon a few pixels below the menu icon
      const menuBox = buttonBoxAtWidth(menuButton, phoneWidth);
      expect(['flex', 'inline-flex']).toContain(menuBox.display);
      expect(menuBox).toMatchObject({
        alignItems: 'center',
        justifyContent: 'center',
      });
      expect(buttonBoxAtWidth(filterButton, phoneWidth)).toEqual(menuBox);

      // The centered items are the icons themselves
      const { getByTestId } = within(header);
      expect(getByTestId('HrToolsMenuIcon').parentElement).toBe(menuButton);
      expect(
        getByTestId('FilterIcon').closest('.MuiBadge-root')?.parentElement,
      ).toBe(filterButton);
    });

    it('keeps both menu buttons level in the header row on phones', async () => {
      const { controls } = await renderEmptyReportHeader();
      const { menuButton, filterButton } = controls;

      const headerRow = layoutParentAtWidth(menuButton, phoneWidth);
      expect(layoutParentAtWidth(filterButton, phoneWidth)).toBe(headerRow);
      expect(getStyleAtWidth(headerRow, 'align-items', phoneWidth)).toBe(
        'center',
      );
      // Same height, centered in the same row, so the top edges match too
      const levelStyles = (button: Element) =>
        ['height', 'align-self', 'margin-top', 'margin-bottom'].map(
          (property) => getStyleAtWidth(button, property, phoneWidth),
        );
      expect(levelStyles(filterButton)).toEqual(levelStyles(menuButton));
    });

    it('shrinks the title on phones so it fits on one line beside the menu buttons', async () => {
      const { controls } = await renderEmptyReportHeader();

      const phoneSize = fontSizePxAtWidth(controls.title, phoneWidth);
      expect(phoneSize).toBeLessThan(
        fontSizePxAtWidth(controls.title, desktopWidth),
      );
      // Still reads as a heading above the body text
      expect(phoneSize).toBeGreaterThan(
        Number.parseFloat(String(theme.typography.body1.fontSize)) *
          theme.typography.htmlFontSize,
      );
    });

    it('shows the whole title on phones instead of cutting it off', async () => {
      const { controls } = await renderEmptyReportHeader();

      expect(
        getStyleAtWidth(controls.title, 'text-overflow', phoneWidth),
      ).not.toBe('ellipsis');
      expect(
        getStyleAtWidth(controls.title, 'white-space', phoneWidth),
      ).not.toBe('nowrap');
    });

    it.each([600, 900, desktopWidth])(
      'keeps the desktop menu buttons and title size at %ipx wide',
      async (width) => {
        const { controls } = await renderEmptyReportHeader();
        const { menuButton, filterButton, title } = controls;

        // The shared header button styles
        [menuButton, filterButton].forEach((button) =>
          expect(buttonBoxAtWidth(button, width)).toMatchObject({
            display: 'inline-block',
            width: '48px',
            height: '48px',
          }),
        );
        expect(getStyleAtWidth(title, 'font-size', width)).toBe(
          theme.typography.h5.fontSize,
        );
      },
    );
  });
});
