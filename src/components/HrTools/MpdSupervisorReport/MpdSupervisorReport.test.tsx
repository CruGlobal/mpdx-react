import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders the How this report works button in the header', async () => {
    const { findByRole } = renderReport();

    userEvent.click(
      await findByRole('button', { name: 'How this report works' }),
    );

    expect(await findByRole('heading', { name: 'Colors' })).toBeInTheDocument();
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
