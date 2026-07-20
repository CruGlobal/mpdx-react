import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StaffAccountQuery } from 'src/components/Shared/StaffAccount/StaffAccount.generated';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { ReportsStaffExpensesQuery } from '../StaffExpenseReport/GetStaffExpense.generated';
import { MPGAIncomeExpensesReport } from './MPGAIncomeExpensesReport';
import { MpgaTransactionsQuery } from './MPGATransactions.generated';

const mutationSpy = jest.fn();
const onNavListToggle = jest.fn();

const title = 'MPGA Report';

// Twelve positive monthly totals so the category aggregates to income only.
const generateBreakdown = (base: number) =>
  Array.from({ length: 12 }, (_, index) => ({
    month: `2024-${String(index + 1).padStart(2, '0')}-01`,
    total: base * (index + 1),
  }));

const mockData = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
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

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
        MPGATransactions: MpgaTransactionsQuery;
        ReportsStaffExpenses: ReportsStaffExpensesQuery;
      }>
        mocks={mockData}
        onCall={mutationSpy}
      >
        <MPGAIncomeExpensesReport
          onNavListToggle={onNavListToggle}
          isNavListOpen={true}
          title={title}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

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

    expect(await findByText('12345')).toBeInTheDocument();
    expect(await findByText('Test Account')).toBeInTheDocument();
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
  });

  describe('Category filtering', () => {
    it('re-renders report rows when a category is unchecked and applied', async () => {
      const { getByRole, findByRole, findAllByText, queryByText } = render(
        <TestComponent />,
      );

      expect(await findByRole('gridcell', { name: 'Benefits' })).toBeVisible();
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
        await findAllByText('Benefits - Workers Compensation'),
      ).toHaveLength(1);
      expect(await findAllByText('Benefits - Program Based')).toHaveLength(1);
    }, 15000);

    it('does not show the Clear button until a category filter is applied', async () => {
      const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

      expect(await findByRole('gridcell', { name: 'Benefits' })).toBeVisible();
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const benefitsCheckbox = await findByRole('checkbox', {
        name: 'Benefits',
      });
      userEvent.click(benefitsCheckbox);

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(await findByRole('button', { name: 'Clear' })).toBeInTheDocument();
    }, 15000);

    it('does not show the Clear button when the dialog is cancelled', async () => {
      const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

      expect(await findByRole('gridcell', { name: 'Benefits' })).toBeVisible();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const cancelButton = await findByRole('button', { name: 'Cancel' });
      userEvent.click(cancelButton);

      await waitFor(() =>
        expect(
          queryByRole('button', { name: 'Cancel' }),
        ).not.toBeInTheDocument(),
      );
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    }, 15000);

    it('resets category filtering when Clear is clicked', async () => {
      const { getByRole, findByRole, findAllByText, queryByText } = render(
        <TestComponent />,
      );

      expect(await findByRole('gridcell', { name: 'Benefits' })).toBeVisible();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const benefitsCheckbox = await findByRole('checkbox', {
        name: 'Benefits',
      });
      userEvent.click(benefitsCheckbox);

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(
        await findAllByText('Benefits - Workers Compensation'),
      ).toHaveLength(1);

      userEvent.click(await findByRole('button', { name: 'Clear' }));

      await waitFor(() =>
        expect(
          queryByText('Benefits - Workers Compensation'),
        ).not.toBeInTheDocument(),
      );
      expect(await findByRole('gridcell', { name: 'Benefits' })).toBeVisible();
    }, 15000);
  });

  describe('Date range filtering', () => {
    it('queries the full selected year when a year is applied', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      await findByRole('gridcell', { name: 'Benefits' });
      mutationSpy.mockClear();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      const lastCompletedYear = DateTime.now().year - 1;
      userEvent.click(
        await findByRole('combobox', { name: 'Select Date Range' }),
      );
      userEvent.click(getByRole('option', { name: String(lastCompletedYear) }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          startMonth: `${lastCompletedYear}-01-01`,
          endMonth: `${lastCompletedYear}-12-31`,
          fundTypes: ['Primary'],
        }),
      );
    }, 15000);

    it('queries the current year up to today for Year to Date', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      await findByRole('gridcell', { name: 'Benefits' });
      mutationSpy.mockClear();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      userEvent.click(
        await findByRole('combobox', { name: 'Select Date Range' }),
      );
      userEvent.click(getByRole('option', { name: 'Year to Date' }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      const now = DateTime.now();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          startMonth: `${now.year}-01-01`,
          endMonth: now.toISODate(),
          fundTypes: ['Primary'],
        }),
      );
    }, 15000);

    it('shows the Clear button after a year is applied', async () => {
      const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

      await findByRole('gridcell', { name: 'Benefits' });
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Report Settings' }));

      userEvent.click(
        await findByRole('combobox', { name: 'Select Date Range' }),
      );
      userEvent.click(getByRole('option', { name: 'Year to Date' }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).not.toBeDisabled());
      userEvent.click(applyButton);

      expect(await findByRole('button', { name: 'Clear' })).toBeInTheDocument();
    }, 15000);
  });
});
