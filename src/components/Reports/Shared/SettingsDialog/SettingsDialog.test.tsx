import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  StaffExpenseCategoryEnum,
  StaffExpensesSubCategoryEnum,
} from 'src/graphql/types.generated';
import { ReportsStaffExpensesQuery } from '../../StaffExpenseReport/GetStaffExpense.generated';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import {
  Filters,
  SettingsDialog,
  SettingsDialogProps,
  getValidationSchema,
} from './SettingsDialog';

const mutationSpy = jest.fn();
const mockCategory = (
  category: StaffExpenseCategoryEnum,
  subCategory: StaffExpensesSubCategoryEnum,
) => ({
  category,
  subcategories: [
    {
      subCategory,
      breakdownByMonth: [
        { transactions: [{ transactedAt: DateTime.now().toISO() }] },
      ],
    },
  ],
});

const defaultCategories = () => [
  mockCategory(
    StaffExpenseCategoryEnum.Benefits,
    StaffExpensesSubCategoryEnum.HealthWelfare,
  ),
  mockCategory(
    StaffExpenseCategoryEnum.Donation,
    StaffExpensesSubCategoryEnum.Donation,
  ),
  mockCategory(
    StaffExpenseCategoryEnum.Salary,
    StaffExpensesSubCategoryEnum.RegularPay,
  ),
  mockCategory(
    StaffExpenseCategoryEnum.Transfer,
    StaffExpensesSubCategoryEnum.Transfer,
  ),
];

const TestComponent: React.FC<
  SettingsDialogProps & {
    onCallMock?: jest.Mock;
    categories?: ReturnType<typeof mockCategory>[];
  }
> = ({
  isOpen,
  onClose,
  selectedFilters,
  selectedFundType,
  time,
  onCallMock,
  isMpgaReport = false,
  transactionYears,
  categories = defaultCategories(),
}) => (
  <TestRouter>
    <GqlMockedProvider<{ ReportsStaffExpenses: ReportsStaffExpensesQuery }>
      onCall={onCallMock}
      mocks={{
        ReportsStaffExpenses: {
          reportsStaffExpenses: { funds: [{ categories }] },
        },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SettingsDialog
          isOpen={isOpen}
          onClose={onClose}
          selectedFilters={selectedFilters}
          selectedFundType={selectedFundType}
          time={time}
          isMpgaReport={isMpgaReport}
          transactionYears={transactionYears}
        />
      </LocalizationProvider>
    </GqlMockedProvider>
  </TestRouter>
);

const baseFilters: Filters = {
  selectedDateRange: null,
  startDate: null,
  endDate: null,
  selectedYear: null,
  categories: [],
};

describe('SettingsDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: mutationSpy,
    selectedFundType: 'Primary',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when isOpen is true', () => {
    const { getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(
      getByRole('heading', { name: 'Report Settings' }),
    ).toBeInTheDocument();
    expect(getByLabelText('Select Date Range')).toBeInTheDocument();
    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('should not render dialog when isOpen is false', () => {
    const { queryByRole } = render(
      <TestComponent {...defaultProps} isOpen={false} />,
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render all date range options', () => {
    const { getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    userEvent.click(getByLabelText('Select Date Range'));

    expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Week to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Month to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Year to Date' })).toBeInTheDocument();
  });

  it('should render all category checkboxes', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(
      await findByRole('checkbox', { name: 'Benefits' }),
    ).toBeInTheDocument();

    expect(getByRole('checkbox', { name: 'Salary' })).toBeInTheDocument();
    expect(getByRole('checkbox', { name: 'Donation' })).toBeInTheDocument();
  });

  it('should populate form with selectedFilters when provided', async () => {
    const selectedFilters: Filters = {
      ...baseFilters,
      selectedDateRange: DateRange.MonthToDate,
      categories: [
        StaffExpenseCategoryEnum.Benefits,
        StaffExpenseCategoryEnum.Salary,
      ],
    };

    const { getByRole, findByRole } = render(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    const dateRangeDropdown = getByRole('combobox', {
      name: 'Select Date Range',
    });
    expect(dateRangeDropdown).toHaveTextContent('Month to Date');

    expect(
      await findByRole('checkbox', { name: 'Benefits' }),
    ).toBeInTheDocument();

    expect(getByRole('checkbox', { name: 'Benefits' })).toBeChecked();
    expect(getByRole('checkbox', { name: 'Salary' })).toBeChecked();
    expect(getByRole('checkbox', { name: 'Donation' })).not.toBeChecked();
  });

  it('should preserve custom dates when no selectedDateRange is set', () => {
    const selectedFilters: Filters = {
      ...baseFilters,
      startDate: DateTime.fromISO('2025-01-01'),
      endDate: DateTime.fromISO('2025-01-31'),
    };

    const { getByLabelText } = render(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    expect(getByLabelText('Start Date')).toHaveValue('01/01/2025');
    expect(getByLabelText('End Date')).toHaveValue('01/31/2025');
  });

  it('should clear custom dates when predefined range is selected', async () => {
    const { getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    const startDateField = getByLabelText('Start Date');
    const endDateField = getByLabelText('End Date');

    userEvent.type(startDateField, '2025-01-01');
    userEvent.type(endDateField, '2025-01-31');

    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Month to Date' }));

    expect(startDateField).toHaveValue('');
    expect(endDateField).toHaveValue('');
  });

  it('should clear predefined range when custom date is set', async () => {
    const { getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    // Select predefined range first
    const dropdown = getByRole('combobox', { name: 'Select Date Range' });
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Year to Date' }));

    expect(dropdown).toHaveTextContent('Year to Date');

    userEvent.type(getByLabelText('Start Date'), '2025-01-01');

    // Predefined range should be cleared
    expect(dropdown).not.toHaveTextContent(DateRange.YearToDate);
  });

  it('should allow equal start and end dates', async () => {
    const { getByLabelText, queryByText } = render(
      <TestComponent {...defaultProps} />,
    );

    const startDateField = getByLabelText('Start Date');
    const endDateField = getByLabelText('End Date');

    userEvent.type(startDateField, '2025-01-01');
    userEvent.type(endDateField, '2025-01-01');

    expect(
      queryByText('Start date must be earlier than end date'),
    ).not.toBeInTheDocument();
  });

  it('rejects a start date after the viewed month when no end date is set', async () => {
    await expect(
      getValidationSchema(DateTime.fromISO('2019-06-01')).validateAt(
        'startDate',
        {
          startDate: DateTime.fromISO('2019-09-01'),
          endDate: null,
        },
      ),
    ).rejects.toThrow(
      'Select an end date when the start date is later than the month being viewed',
    );
  });

  it('accepts a start date within the viewed month when no end date is set', async () => {
    await expect(
      getValidationSchema(DateTime.fromISO('2019-06-01')).validateAt(
        'startDate',
        {
          startDate: DateTime.fromISO('2019-06-30'),
          endDate: null,
        },
      ),
    ).resolves.toBeTruthy();
  });

  it('names the grouping the rules apply and how to opt out', () => {
    const { getByText } = render(<TestComponent {...defaultProps} />);

    expect(
      getByText(
        `Income and expenses are combined using Cru's standard reporting rules. Salary and benefits by pay date, other categories by month. Uncheck a category to list every transaction in the category separately.`,
      ),
    ).toBeInTheDocument();
  });

  it('says so when nothing in range can be combined', async () => {
    const { findByText, queryByLabelText } = render(
      <TestComponent
        {...defaultProps}
        categories={[
          mockCategory(
            StaffExpenseCategoryEnum.Transfer,
            StaffExpensesSubCategoryEnum.Transfer,
          ),
        ]}
      />,
    );

    expect(
      await findByText(
        'None of the categories in this date range can be combined.',
      ),
    ).toBeInTheDocument();
    expect(queryByLabelText('Transfer')).not.toBeInTheDocument();
  });

  it('excludes a category whose transactions all itemize, even when the category can combine', async () => {
    const { findByLabelText, queryByLabelText } = render(
      <TestComponent
        {...defaultProps}
        categories={[
          mockCategory(
            StaffExpenseCategoryEnum.Benefits,
            StaffExpensesSubCategoryEnum.HealthWelfare,
          ),
          // Donations roll up monthly, but non-cash gifts under them do not.
          mockCategory(
            StaffExpenseCategoryEnum.Donation,
            StaffExpensesSubCategoryEnum.NonCash,
          ),
        ]}
      />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();
    expect(queryByLabelText('Donation')).not.toBeInTheDocument();
  });

  it('offers only the categories that can be combined, each checked', async () => {
    const { findByLabelText, getByLabelText, queryByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();
    expect(getByLabelText('Salary')).toBeChecked();
    expect(getByLabelText('Donation')).toBeChecked();

    // Every transfer subcategory is intentionally itemized, so a checkbox for it should not do anything.
    expect(queryByLabelText('Transfer')).not.toBeInTheDocument();
  });

  it('should toggle category selection', async () => {
    const { getByLabelText, findByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    const benefitsCheckbox = getByLabelText('Benefits');
    expect(benefitsCheckbox).toBeChecked();
    userEvent.click(benefitsCheckbox);
    expect(benefitsCheckbox).not.toBeChecked();
  });

  it('should call onClose with the remaining categories when one is deselected', async () => {
    const { findByLabelText, getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();

    userEvent.click(getByLabelText('Benefits'));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledWith({
        ...baseFilters,
        categories: [
          StaffExpenseCategoryEnum.Donation,
          StaffExpenseCategoryEnum.Salary,
        ],
      });
    });
  });

  it('should submit an empty categories array when all are deselected', async () => {
    const { findByLabelText, getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();

    userEvent.click(getByLabelText('Benefits'));
    userEvent.click(getByLabelText('Donation'));
    userEvent.click(getByLabelText('Salary'));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledWith({
        ...baseFilters,
        categories: [],
      });
    });
  });

  it('should preserve default when only the date range changes', async () => {
    const { findByLabelText, getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();

    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Month to Date' }));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDateRange: DateRange.MonthToDate,
          categories: null,
        }),
      );
    });
  });

  it('should calculate dates for predefined ranges on submission', async () => {
    const { getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} />,
    );

    // Select predefined range
    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Month to Date' }));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDateRange: DateRange.MonthToDate,
          startDate: expect.any(Object),
          endDate: expect.any(Object),
        }),
      );
    });
  });

  it('should call onClose with original filters when Cancel is clicked', async () => {
    const originalFilters: Filters = {
      ...baseFilters,
      selectedDateRange: DateRange.WeekToDate,
      categories: [StaffExpenseCategoryEnum.Salary],
    };

    const { findByLabelText, getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} selectedFilters={originalFilters} />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    userEvent.click(getByLabelText('Benefits'));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(mutationSpy).toHaveBeenCalledWith(originalFilters);
  });

  it('should disable Apply Filters button when form is not dirty and enable when dirty', async () => {
    const { findByRole, findByLabelText, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(
      await findByRole('button', { name: 'Apply Filters' }),
    ).toBeDisabled();

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    // Make form dirty
    userEvent.click(getByLabelText('Benefits'));

    expect(await findByRole('button', { name: 'Apply Filters' })).toBeEnabled();
  });

  it('should call onClose with original filters when dialog backdrop is clicked', () => {
    const { getByRole } = render(
      <TestComponent
        {...defaultProps}
        onClose={mutationSpy}
        selectedFilters={baseFilters}
      />,
    );
    const dialog = getByRole('dialog');
    userEvent.click(dialog.parentElement!);

    expect(mutationSpy).toHaveBeenCalledWith(baseFilters);
  });

  it('falls back to the standard rules when selectedFilters or its categories are null', async () => {
    const { findByLabelText, queryByLabelText, rerender } = render(
      <TestComponent {...defaultProps} selectedFilters={undefined} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();
    expect(queryByLabelText('Transfer')).not.toBeInTheDocument();

    const selectedFilters: Filters = {
      ...baseFilters,
      categories: null,
    };

    rerender(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    expect(await findByLabelText('Benefits')).toBeChecked();
  });

  it('should query using the time prop month when no date filter is set', async () => {
    const time = DateTime.fromISO('2025-10-01');

    render(
      <TestComponent {...defaultProps} time={time} onCallMock={mutationSpy} />,
    );

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('ReportsStaffExpenses', {
        startMonth: '2025-10-01',
        endMonth: '2025-10-31',
        fundTypes: ['Primary'],
      });
    });
  });

  it('should fall back to current month for category query when time prop is not provided', async () => {
    render(<TestComponent {...defaultProps} onCallMock={mutationSpy} />);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation('ReportsStaffExpenses', {
        startMonth: '2020-01-01',
        endMonth: '2020-01-31',
        fundTypes: ['Primary'],
      });
    });
  });

  describe('MPGA report specific behavior', () => {
    const defaultProps = {
      isOpen: true,
      onClose: mutationSpy,
      selectedFundType: 'Primary',
      isMpgaReport: true,
      transactionYears: [2018, 2019, 2020],
    };

    it('displays the simplified date range dropdown and category checkboxes without custom date fields', async () => {
      const {
        queryByLabelText,
        getByLabelText,
        findByLabelText,
        getByText,
        getByRole,
        queryByRole,
      } = render(<TestComponent {...defaultProps} />);

      expect(
        getByText(
          'Income and expenses are combined by categories by default. This may be useful for long date ranges (e.g., "Year to Date"). Select which categories to keep consolidated.',
        ),
      ).toBeInTheDocument();

      expect(await findByLabelText('Benefits')).toBeInTheDocument();
      expect(getByLabelText('Salary')).toBeInTheDocument();
      expect(getByLabelText('Donation')).toBeInTheDocument();

      const dropdown = getByLabelText('Select Date Range');
      expect(dropdown).toBeInTheDocument();
      userEvent.click(dropdown);
      expect(getByRole('option', { name: 'Year to Date' })).toBeInTheDocument();
      expect(
        queryByRole('option', { name: 'Week to Date' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('option', { name: 'Month to Date' }),
      ).not.toBeInTheDocument();

      expect(queryByLabelText('Start Date')).not.toBeInTheDocument();
      expect(queryByLabelText('End Date')).not.toBeInTheDocument();
    });

    it('applies category changes with the date fields left untouched', async () => {
      const { findByLabelText, getByLabelText, getByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      // MPGA combines every category by default, including the ones the staff expense report itemizes.
      expect(await findByLabelText('Benefits')).toBeChecked();
      expect(getByLabelText('Transfer')).toBeChecked();

      userEvent.click(getByLabelText('Benefits'));
      userEvent.click(getByRole('button', { name: 'Apply Filters' }));

      await waitFor(() => {
        expect(mutationSpy).toHaveBeenCalledWith({
          ...baseFilters,
          categories: [
            StaffExpenseCategoryEnum.Donation,
            StaffExpenseCategoryEnum.Salary,
            StaffExpenseCategoryEnum.Transfer,
          ],
        });
      });
    });

    it('lists the transaction years in the date range dropdown', () => {
      const { getByLabelText, getByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      userEvent.click(getByLabelText('Select Date Range'));

      expect(getByRole('option', { name: '2018' })).toBeInTheDocument();
      expect(getByRole('option', { name: '2019' })).toBeInTheDocument();
      expect(getByRole('option', { name: '2020' })).toBeInTheDocument();
    });

    it('correctly gets Jan 1 – Dec 31 and the selected year when a year is picked', async () => {
      const { getByLabelText, getByRole, findByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      const lastCompletedYear = DateTime.now().year - 1;
      userEvent.click(getByLabelText('Select Date Range'));
      userEvent.click(getByRole('option', { name: String(lastCompletedYear) }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).toBeEnabled());
      userEvent.click(applyButton);

      await waitFor(() => {
        const submitted = mutationSpy.mock.calls.at(-1)?.[0] as Filters;
        expect(submitted.selectedYear).toBe(lastCompletedYear);
        expect((submitted.startDate as DateTime).toISODate()).toBe(
          `${lastCompletedYear}-01-01`,
        );
        expect((submitted.endDate as DateTime).toISODate()).toBe(
          `${lastCompletedYear}-12-31`,
        );
      });
    });

    it('submits Year to Date with no specific year', async () => {
      const { getByLabelText, getByRole, findByRole } = render(
        <TestComponent {...defaultProps} />,
      );

      userEvent.click(getByLabelText('Select Date Range'));
      userEvent.click(getByRole('option', { name: 'Year to Date' }));

      const applyButton = await findByRole('button', { name: 'Apply Filters' });
      await waitFor(() => expect(applyButton).toBeEnabled());
      userEvent.click(applyButton);

      await waitFor(() => {
        const submitted = mutationSpy.mock.calls.at(-1)?.[0] as Filters;
        expect(submitted.selectedDateRange).toBe(DateRange.YearToDate);
        expect(submitted.selectedYear).toBeNull();
      });
    });
  });
});
