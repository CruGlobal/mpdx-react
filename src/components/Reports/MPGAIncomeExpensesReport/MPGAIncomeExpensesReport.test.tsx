import React, { useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  HcmQuery,
  useHcmQuery,
} from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { StaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ReportsStaffExpensesQuery } from '../StaffExpenseReport/GetStaffExpense.generated';
import { MPGAIncomeExpensesReportProvider } from './MPGAIncomeExpensesContext/MPGAIncomeExpensesContext';
import { MPGAIncomeExpensesReport } from './MPGAIncomeExpensesReport';
import { MpgaTransactionsQuery } from './MPGATransactions.generated';

// Records each Hcm read's options, since Apollo merges the page's reads into one request
jest.mock('src/components/HrTools/Shared/HcmData/Hcm.generated', () => {
  const actual = jest.requireActual(
    'src/components/HrTools/Shared/HcmData/Hcm.generated',
  );
  return { ...actual, useHcmQuery: jest.fn(actual.useHcmQuery) };
});

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();

const title = 'MPGA Report';
const staffAccountId = '1000000001';
const staffName = 'Jane Doe';

const hcmPersonNotFound = new GraphQLError('HCM person not found', {
  extensions: { code: 'HCM_PERSON_NOT_FOUND' },
});
const notFoundNote =
  "HR no longer has a record for you, so salary isn't split by person on this report.";
const hcmUnavailable = new GraphQLError('HCM UserInfo service unavailable', {
  extensions: { code: 'HCM_UNAVAILABLE' },
});

// Twelve positive monthly totals so the category aggregates to income only.
const generateBreakdown = (base: number) =>
  Array.from({ length: 12 }, (_, index) => ({
    month: `2024-${String(index + 1).padStart(2, '0')}-01`,
    total: base * (index + 1),
  }));

const mockData = {
  // Pin the sync state so the HcmSyncStatus banner cannot pre-empt the
  // report error alert these tests look for
  Hcm: {
    hcm: [{ outOfSync: false }],
  },
  StaffAccount: {
    staffAccount: {
      name: 'Test Account',
    },
  },
  MPGATransactions: {
    reportsStaffExpenses: {
      funds: [
        {
          fundType: 'Primary',
          total: 15600,
          categories: [
            {
              category: StaffExpenseCategoryEnum.Benefits,
              averagePerMonth: 1300,
              total: 15600,
              breakdownByMonth: generateBreakdown(100),
              subcategories: [
                {
                  subCategory: StaffExpensesSubCategoryEnum.WorkersCompensation,
                  averagePerMonth: 650,
                  total: 7800,
                  breakdownByMonth: generateBreakdown(100),
                },
                {
                  subCategory: StaffExpensesSubCategoryEnum.ProgramBased,
                  averagePerMonth: 650,
                  total: 7800,
                  breakdownByMonth: generateBreakdown(100),
                },
              ],
            },
          ],
        },
      ],
    },
  },
  ReportsStaffExpenses: {
    reportsStaffExpenses: {
      funds: [
        {
          categories: [
            {
              category: StaffExpenseCategoryEnum.Benefits,
              subcategories: [
                {
                  breakdownByMonth: [
                    {
                      transactions: [
                        { transactedAt: '2020-01-01T00:00:00.000Z' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

interface TestComponentProps {
  staffAccountId?: string;
  staffName?: string;
  failReportCalls?: number;
  hcmError?: GraphQLError;
}

const TestComponent: React.FC<TestComponentProps> = ({
  staffAccountId,
  staffName,
  failReportCalls = 0,
  hcmError,
}) => {
  const reportCalls = useRef(0);
  const reportsStaffExpenses = {
    ...mockData.MPGATransactions.reportsStaffExpenses,
    ...(staffName && { name: staffName }),
  };
  const failingReport = (() => {
    if (reportCalls.current++ < failReportCalls) {
      throw new Error('SAA is unavailable');
    }
    return reportsStaffExpenses;
  }) as unknown as MpgaTransactionsQuery['reportsStaffExpenses'];

  return (
    <ThemeProvider theme={theme}>
      <TestRouter>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider<{
              Hcm: HcmQuery;
              StaffAccount: StaffAccountQuery;
              MPGATransactions: MpgaTransactionsQuery;
              ReportsStaffExpenses: ReportsStaffExpensesQuery;
            }>
              mocks={{
                ...mockData,
                ...(hcmError && {
                  Hcm: {
                    hcm: (() => {
                      throw hcmError;
                    }) as unknown as HcmQuery['hcm'],
                  },
                }),
                MPGATransactions: {
                  reportsStaffExpenses: failReportCalls
                    ? failingReport
                    : reportsStaffExpenses,
                },
              }}
              onCall={mutationSpy}
            >
              <MPGAIncomeExpensesReportProvider staffAccountId={staffAccountId}>
                <MPGAIncomeExpensesReport
                  onNavListToggle={onNavListToggle}
                  isNavListOpen={true}
                  title={title}
                />
              </MPGAIncomeExpensesReportProvider>
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

// Role+name lookups walk every node of a page holding several data grids and
// cost seconds each, so match the cell text directly instead.
const inGridCell = { selector: '[role="gridcell"] *' };

const resizeObserverMock = () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
beforeAll(() => {
  window.ResizeObserver = jest.fn().mockImplementation(resizeObserverMock);
});

beforeEach(() => {
  Object.defineProperty(window, 'print', {
    value: jest.fn(),
    writable: true,
    configurable: true,
  });
});

describe('MPGAIncomeExpensesReport', () => {
  it('renders data', async () => {
    const { getByRole, findByText } = render(<TestComponent />);
    expect(getByRole('heading', { name: title })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Print' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Report Settings' }),
    ).toBeInTheDocument();

    expect(await findByText('Test Account')).toBeInTheDocument();
  });

  describe('when the report fails to load', () => {
    it('shows a friendly error instead of the empty report', async () => {
      const { findByRole, queryByText } = render(
        <TestComponent failReportCalls={Infinity} />,
      );

      const alert = await findByRole('alert');
      expect(alert).toHaveTextContent(
        'The Income & Expenses report could not be loaded. Please try again later.',
      );
      // The raw error is left to the global error snackbar.
      expect(alert).not.toHaveTextContent('SAA is unavailable');
      expect(queryByText('No Income data available')).not.toBeInTheDocument();
      expect(queryByText('No Expenses data available')).not.toBeInTheDocument();
    });

    it('disables Export CSV and Print', async () => {
      const { findByRole, getByRole } = render(
        <TestComponent failReportCalls={Infinity} />,
      );

      await findByRole('alert');
      expect(getByRole('button', { name: 'Export CSV' })).toBeDisabled();
      expect(getByRole('button', { name: 'Print' })).toBeDisabled();
    });

    it('loads the report when Try Again is clicked', async () => {
      const { findByRole, findByText, queryByRole } = render(
        <TestComponent failReportCalls={1} />,
      );

      const alert = await findByRole('alert');
      userEvent.click(within(alert).getByRole('button', { name: 'Try Again' }));

      expect(await findByText('Benefits', inGridCell)).toBeVisible();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    }, 30000);

    it('loads the report when a different date range is chosen', async () => {
      const { findByRole, findByText, getByRole, queryByRole } = render(
        <TestComponent failReportCalls={1} />,
      );

      await findByRole('alert');
      userEvent.click(getByRole('button', { name: 'Report Settings' }));
      userEvent.click(
        await findByRole('combobox', { name: 'Select Date Range' }),
      );
      userEvent.click(getByRole('option', { name: 'Year to Date' }));
      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(
        await findByText('Benefits', inGridCell, { timeout: 5000 }),
      ).toBeVisible();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    }, 30000);

    it('hides the empty account info in supervisor view', async () => {
      const { findByRole, queryByTestId } = render(
        <TestComponent
          staffAccountId={staffAccountId}
          failReportCalls={Infinity}
        />,
      );

      await findByRole('alert');
      expect(queryByTestId('account-info')).not.toBeInTheDocument();
    });
  });

  describe('when HCM has no record of the person', () => {
    it('loads the report with no error', async () => {
      const { findByText, queryByRole } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      expect(await findByText('Benefits', inGridCell)).toBeVisible();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });

    it('notes that salary is not split by person', async () => {
      const { findByRole } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      expect(await findByRole('status')).toHaveTextContent(notFoundNote);
    });

    it('keeps the global error toast quiet for that error only', async () => {
      const { findByText } = render(
        <TestComponent hcmError={hcmPersonNotFound} />,
      );

      await findByText('Benefits', inGridCell);
      expect(mutationSpy).toHaveGraphqlOperation('Hcm');
      mutationSpy.mock.calls
        .filter(([{ operation }]) => operation.operationName === 'Hcm')
        .forEach(([{ operation }]) =>
          expect(operation.getContext().suppressErrorCodes).toEqual([
            'HCM_PERSON_NOT_FOUND',
          ]),
        );
      // The merged request carries whichever read's context started it, so every read needs it
      const hcmReads = jest.mocked(useHcmQuery).mock.calls;
      expect(hcmReads.length).toBeGreaterThan(0);
      hcmReads.forEach(([options]) =>
        expect(options?.context?.suppressErrorCodes).toEqual([
          'HCM_PERSON_NOT_FOUND',
        ]),
      );
    });
  });

  it('still loads the report when HCM is unavailable', async () => {
    const { findByText, queryByText } = render(
      <TestComponent hcmError={hcmUnavailable} />,
    );

    expect(await findByText('Benefits', inGridCell)).toBeVisible();
    expect(queryByText(notFoundNote)).not.toBeInTheDocument();
  });

  it('shows no HR record note when HCM loads', async () => {
    const { findByText, queryByText } = render(<TestComponent />);

    expect(await findByText('Benefits', inGridCell)).toBeVisible();
    expect(queryByText(notFoundNote)).not.toBeInTheDocument();
  });

  describe('supervisor view', () => {
    it('does not show the view only banner on your own report', async () => {
      const { findByText, queryByRole } = render(<TestComponent />);

      expect(await findByText('Test Account')).toBeInTheDocument();
      expect(
        queryByRole('link', { name: 'Back to MPD Supervisor Report' }),
      ).not.toBeInTheDocument();
    });

    it('shows the view only banner naming the staff member', async () => {
      const { findByText, getByRole } = render(
        <TestComponent staffAccountId={staffAccountId} staffName={staffName} />,
      );

      expect(
        await findByText(
          "Currently viewing Jane Doe's MPGA report · read only.",
        ),
      ).toBeInTheDocument();
      expect(
        getByRole('link', { name: 'Back to MPD Supervisor Report' }),
      ).toBeInTheDocument();
    });

    it('loads report settings categories for the staff member being viewed', async () => {
      const { getByRole } = render(
        <TestComponent staffAccountId={staffAccountId} staffName={staffName} />,
      );

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ReportsStaffExpenses', {
          staffAccountId,
        }),
      );
    });
  });

  it('should print', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Print' }));
    await waitFor(() => expect(window.print).toHaveBeenCalled());
  });

  it('renders nav list icon and onclick triggers onNavListToggle', async () => {
    onNavListToggle.mockClear();
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ReportsMenuIcon')).toBeInTheDocument();
    userEvent.click(getByTestId('ReportsMenuIcon'));
    await waitFor(() => expect(onNavListToggle).toHaveBeenCalled());
  }, 30000);

  describe('Category filtering', () => {
    it('re-renders report rows when a category is unchecked and applied', async () => {
      const { getByRole, findByRole, findByText, findAllByText, queryByText } =
        render(<TestComponent />);

      expect(await findByText('Benefits', inGridCell)).toBeVisible();
      expect(
        queryByText('Benefits - Workers Compensation'),
      ).not.toBeInTheDocument();
      expect(queryByText('Benefits - Program Based')).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const benefitsCheckbox = await findByRole('checkbox', {
        name: 'Benefits',
      });
      userEvent.click(benefitsCheckbox);

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(
        await findAllByText('Benefits - Workers Compensation', undefined, {
          timeout: 5000,
        }),
      ).toHaveLength(1);
      expect(
        await findAllByText('Benefits - Program Based', undefined, {
          timeout: 5000,
        }),
      ).toHaveLength(1);
    }, 30000);

    it('does not show the Clear button when only a category filter is applied', async () => {
      const { getByRole, findByRole, findByText, findAllByText, queryByRole } =
        render(<TestComponent />);

      expect(await findByText('Benefits', inGridCell)).toBeVisible();
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const benefitsCheckbox = await findByRole('checkbox', {
        name: 'Benefits',
      });
      userEvent.click(benefitsCheckbox);

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(
        await findAllByText('Benefits - Workers Compensation', undefined, {
          timeout: 5000,
        }),
      ).toHaveLength(1);
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    }, 30000);

    it('does not show the Clear button when the dialog is cancelled', async () => {
      const { getByRole, findByRole, findByText, queryByRole } = render(
        <TestComponent />,
      );

      expect(await findByText('Benefits', inGridCell)).toBeVisible();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const cancelButton = await findByRole('button', { name: 'Cancel' });
      userEvent.click(cancelButton);

      await waitFor(() =>
        expect(
          queryByRole('button', { name: 'Cancel' }),
        ).not.toBeInTheDocument(),
      );
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    }, 30000);
  });

  describe('Date range filtering', () => {
    it('shows the Clear button after a year is applied', async () => {
      const { getByRole, findByRole, findByText, queryByRole } = render(
        <TestComponent />,
      );

      await findByText('Benefits', inGridCell);
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      userEvent.click(
        await findByRole('combobox', { name: 'Select Date Range' }),
      );
      userEvent.click(getByRole('option', { name: 'Year to Date' }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(
        await findByRole('button', { name: 'Clear' }, { timeout: 5000 }),
      ).toBeInTheDocument();
    }, 30000);
  });

  // jsdom cannot measure widths or apply the breakpoint media queries, so these
  // tests check the plain styles that let the row fit on a phone.
  describe('toolbar', () => {
    // The toolbar row has no role of its own, so reach it through Print.
    const getToolbar = (printButton: HTMLElement) =>
      printButton.parentElement as HTMLElement;

    it('wraps the buttons onto a second row when they do not fit', () => {
      const { getByRole } = render(<TestComponent />);
      const toolbar = getToolbar(getByRole('button', { name: 'Print' }));

      expect(toolbar).toContainElement(
        getByRole('button', { name: 'Report Settings' }),
      );
      expect(toolbar).toContainElement(
        getByRole('button', { name: 'Export CSV' }),
      );
      expect(toolbar).toHaveStyle({ flexWrap: 'wrap' });
    });

    it('keeps each button label on one line', () => {
      const { getByRole } = render(<TestComponent />);

      ['Report Settings', 'Export CSV', 'Print'].forEach((name) =>
        expect(getByRole('button', { name })).toHaveStyle({
          whiteSpace: 'nowrap',
        }),
      );
    });

    it('still has the divider between Report Settings and Export CSV', () => {
      const { getByRole } = render(<TestComponent />);
      const toolbar = getToolbar(getByRole('button', { name: 'Print' }));

      expect(within(toolbar).getByRole('separator')).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
    });

    it('opens the Export CSV menu from the toolbar', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      userEvent.click(getByRole('button', { name: 'Export CSV' }));

      expect(
        await findByRole('menuitem', { name: 'Income Report' }),
      ).toBeInTheDocument();
    });
  });
});
