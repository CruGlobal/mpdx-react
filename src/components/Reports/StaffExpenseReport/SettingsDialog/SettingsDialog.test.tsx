import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import { ReportsStaffExpensesQuery } from '../GetStaffExpense.generated';
import { DateRange } from '../Helpers/StaffReportEnum';
import { Filters, SettingsDialog, SettingsDialogProps } from './SettingsDialog';

const TestComponent: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
  selectedFundType,
}) => (
  <TestRouter>
    <GqlMockedProvider<{ ReportsStaffExpenses: ReportsStaffExpensesQuery }>
      mocks={{
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
                              { transactedAt: DateTime.now().toISO() },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    category: StaffExpenseCategoryEnum.Donation,
                    subcategories: [
                      {
                        breakdownByMonth: [
                          {
                            transactions: [
                              {
                                transactedAt: DateTime.now().toISO(),
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    category: StaffExpenseCategoryEnum.Salary,
                    subcategories: [
                      {
                        breakdownByMonth: [
                          {
                            transactions: [
                              {
                                transactedAt: DateTime.now().toISO(),
                              },
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
      }}
    >
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SettingsDialog
          isOpen={isOpen}
          onClose={onClose}
          selectedFilters={selectedFilters}
          selectedFundType={selectedFundType}
        />
      </LocalizationProvider>
    </GqlMockedProvider>
  </TestRouter>
);

describe('SettingsDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
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
      selectedDateRange: DateRange.MonthToDate,
      startDate: null,
      endDate: null,
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
      selectedDateRange: null,
      startDate: DateTime.fromISO('2025-01-01'),
      endDate: DateTime.fromISO('2025-01-31'),
      categories: [],
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

  it('should toggle category selection', async () => {
    const { getByLabelText, findByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    const benefitsCheckbox = getByLabelText('Benefits');
    const salaryCheckbox = getByLabelText('Salary');

    expect(benefitsCheckbox).not.toBeChecked();
    expect(salaryCheckbox).not.toBeChecked();

    userEvent.click(benefitsCheckbox);
    userEvent.click(salaryCheckbox);

    expect(benefitsCheckbox).toBeChecked();
    expect(salaryCheckbox).toBeChecked();

    userEvent.click(benefitsCheckbox);
    expect(benefitsCheckbox).not.toBeChecked();
  });

  it('should call onClose with form values when Apply Filters is clicked', async () => {
    const onClose = jest.fn();

    const { findByLabelText, getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} onClose={onClose} />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    userEvent.click(getByLabelText('Benefits'));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith({
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: [StaffExpenseCategoryEnum.Benefits],
      });
    });
  });

  it('should calculate dates for predefined ranges on submission', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} onClose={onClose} />,
    );

    // Select predefined range
    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Month to Date' }));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDateRange: DateRange.MonthToDate,
          startDate: expect.any(Object),
          endDate: expect.any(Object),
        }),
      );
    });
  });

  it('should call onClose with original filters when Cancel is clicked', async () => {
    const onClose = jest.fn();
    const originalFilters: Filters = {
      selectedDateRange: DateRange.WeekToDate,
      startDate: null,
      endDate: null,
      categories: [StaffExpenseCategoryEnum.Salary],
    };

    const { findByLabelText, getByRole, getByLabelText } = render(
      <TestComponent
        {...defaultProps}
        onClose={onClose}
        selectedFilters={originalFilters}
      />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    userEvent.click(getByLabelText('Benefits'));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledWith(originalFilters);
  });

  it('should reset form when Cancel is clicked', async () => {
    const onClose = jest.fn();

    const { findByLabelText, getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} onClose={onClose} />,
    );

    expect(await findByLabelText('Benefits')).toBeInTheDocument();

    userEvent.click(getByLabelText('Benefits'));
    expect(getByLabelText('Benefits')).toBeChecked();

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
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
    const onClose = jest.fn();
    const originalFilters: Filters = {
      selectedDateRange: null,
      startDate: null,
      endDate: null,
      categories: [],
    };

    const { getByRole } = render(
      <TestComponent
        {...defaultProps}
        onClose={onClose}
        selectedFilters={originalFilters}
      />,
    );
    const dialog = getByRole('dialog');
    userEvent.click(dialog.parentElement!);

    expect(onClose).toHaveBeenCalledWith(originalFilters);
  });

  it('should handle undefined selectedFilters and undefined categories', async () => {
    const { findByLabelText, rerender } = render(
      <TestComponent {...defaultProps} selectedFilters={undefined} />,
    );

    expect(await findByLabelText('Benefits')).not.toBeChecked();

    // Also test with defined filters but undefined categories
    const selectedFilters: Filters = {
      selectedDateRange: null,
      startDate: null,
      endDate: null,
      categories: undefined,
    };

    rerender(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    expect(await findByLabelText('Benefits')).not.toBeChecked();
  });
});
