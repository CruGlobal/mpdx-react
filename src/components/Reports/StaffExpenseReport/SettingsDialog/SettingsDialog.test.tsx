import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { DateRange } from '../Helpers/StaffReportEnum';
import { Filters, SettingsDialog } from './SettingsDialog';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('src/components/common/DateTimePickers/CustomDateField', () => ({
  CustomDateField: ({ label, value, onChange, ...props }: any) => (
    <input
      data-testid={`date-field-${label}`}
      placeholder={label}
      value={value ? value.toISODate() : ''}
      onChange={(e) => {
        const date = e.target.value ? DateTime.fromISO(e.target.value) : null;
        onChange(date);
      }}
      {...props}
    />
  ),
}));

describe('SettingsDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog when isOpen is true', () => {
    const { getByText, getByLabelText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    expect(getByText('Report Settings')).toBeInTheDocument();
    expect(getByLabelText('Select Date Range')).toBeInTheDocument();
    expect(getByText('Or enter a custom date range:')).toBeInTheDocument();
    expect(getByText('Select Categories:')).toBeInTheDocument();
  });

  it('should not render dialog when isOpen is false', () => {
    const { queryByText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} isOpen={false} />
      </SnackbarProvider>,
    );

    expect(queryByText('Report Settings')).not.toBeInTheDocument();
  });

  it('should render all date range options', () => {
    const { getByRole, getByLabelText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    fireEvent.mouseDown(getByLabelText('Select Date Range'));

    expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Week to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Month to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Year to Date' })).toBeInTheDocument();
  });

  it('should render all category checkboxes', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    expect(getByRole('checkbox', { name: 'Benefits' })).toBeInTheDocument();
    expect(getByRole('checkbox', { name: 'Salary' })).toBeInTheDocument();
    expect(
      getByRole('checkbox', { name: 'Contributions' }),
    ).toBeInTheDocument();
  });

  it('should populate form with selectedFilters when provided', () => {
    const selectedFilters: Filters = {
      selectedDateRange: DateRange.MonthToDate,
      startDate: null,
      endDate: null,
      categories: ['Benefits', 'Salary'],
    };

    const { getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} selectedFilters={selectedFilters} />
      </SnackbarProvider>,
    );

    const dateRangeDropdown = getByRole('combobox', {
      name: 'Select Date Range',
    });
    expect(dateRangeDropdown).toHaveTextContent('Month to Date');

    expect(getByRole('checkbox', { name: 'Benefits' })).toBeChecked();
    expect(getByRole('checkbox', { name: 'Salary' })).toBeChecked();
    expect(getByRole('checkbox', { name: 'Contributions' })).not.toBeChecked();
  });

  it('should clear custom dates when selectedDateRange is set', () => {
    const selectedFilters: Filters = {
      selectedDateRange: DateRange.WeekToDate,
      startDate: DateTime.fromISO('2025-01-01'),
      endDate: DateTime.fromISO('2025-01-31'),
      categories: [],
    };

    const { getByTestId } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} selectedFilters={selectedFilters} />,
      </SnackbarProvider>,
    );

    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    expect(startDateField).toHaveValue('');
    expect(endDateField).toHaveValue('');
  });

  it('should preserve custom dates when no selectedDateRange is set', () => {
    const selectedFilters: Filters = {
      selectedDateRange: undefined,
      startDate: DateTime.fromISO('2025-01-01'),
      endDate: DateTime.fromISO('2025-01-31'),
      categories: [],
    };

    const { getByTestId } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} selectedFilters={selectedFilters} />
      </SnackbarProvider>,
    );

    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    expect(startDateField).toHaveValue('2025-01-01');
    expect(endDateField).toHaveValue('2025-01-31');
  });

  it('should clear custom dates when predefined range is selected', async () => {
    const { getByTestId, getByLabelText, getByText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    // Set custom dates first
    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    userEvent.type(startDateField, '2025-01-01');
    userEvent.type(endDateField, '2025-01-31');

    // Select predefined range
    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByText('Month to Date'));

    // Custom dates should be cleared
    expect(startDateField).toHaveValue('');
    expect(endDateField).toHaveValue('');
  });

  it('should clear predefined range when custom date is set', async () => {
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    // Select predefined range first
    const dropdown = getByRole('combobox', { name: 'Select Date Range' });
    userEvent.click(dropdown);
    userEvent.click(getByRole('option', { name: 'Year to Date' }));

    expect(dropdown).toHaveTextContent('Year to Date');

    // Set custom date
    const startDateField = getByTestId('date-field-Start Date');
    userEvent.type(startDateField, '2025-01-01');

    // Predefined range should be cleared
    expect(dropdown).not.toHaveTextContent(DateRange.YearToDate);
  });

  it('should allow equal start and end dates', async () => {
    const { getByTestId, queryByText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    userEvent.type(startDateField, '2025-01-01');
    userEvent.type(endDateField, '2025-01-01');

    // Should not show error
    expect(
      queryByText('Start date must be earlier than end date'),
    ).not.toBeInTheDocument();
  });

  it('should toggle category selection', async () => {
    const { getByLabelText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

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

    const { getByLabelText, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} onClose={onClose} />
      </SnackbarProvider>,
    );

    // Select a category
    userEvent.click(getByLabelText('Benefits'));

    // Submit form
    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith({
        selectedDateRange: undefined,
        startDate: null,
        endDate: null,
        categories: ['Benefits'],
      });
    });
  });

  it('should calculate dates for predefined ranges on submission', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByText, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} onClose={onClose} />
      </SnackbarProvider>,
    );

    // Select predefined range
    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByText('Month to Date'));

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

  it('should preserve custom dates on submission', async () => {
    const onClose = jest.fn();

    const { getByTestId, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} onClose={onClose} />
      </SnackbarProvider>,
    );

    const startDateField = getByTestId('date-field-Start Date');
    userEvent.type(startDateField, '2025-01-01');

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDateRange: undefined,
          startDate: expect.any(DateTime),
          endDate: null,
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
      categories: ['Salary'],
    };

    const { getByLabelText, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog
          {...defaultProps}
          onClose={onClose}
          selectedFilters={originalFilters}
        />
      </SnackbarProvider>,
    );

    userEvent.click(getByLabelText('Benefits'));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledWith(originalFilters);
  });

  it('should reset form when Cancel is clicked', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} onClose={onClose} />
      </SnackbarProvider>,
    );

    // Make changes
    await userEvent.click(getByLabelText('Benefits'));
    expect(getByLabelText('Benefits')).toBeChecked();

    // Cancel
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    // Form should be reset (but we can't easily test this without re-opening)
    expect(onClose).toHaveBeenCalled();
  });
  it('should disable Apply Filters button when form is not dirty', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    const applyButton = getByRole('button', { name: 'Apply Filters' });
    expect(applyButton).toBeDisabled();
  });

  it('should enable Apply Filters button when form is dirty and valid', async () => {
    const { getByRole, getByLabelText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    // Make form dirty
    userEvent.click(getByLabelText('Benefits'));

    const applyButton = getByRole('button', { name: 'Apply Filters' });
    expect(applyButton).toBeEnabled();
  });

  it('should disable Apply Filters button when form is invalid', async () => {
    const { getByTestId, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} />
      </SnackbarProvider>,
    );

    // Create invalid state (start date > end date)
    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    userEvent.type(endDateField, '2025-01-01');
    userEvent.type(startDateField, '2025-01-31');

    await waitFor(() => {
      const applyButton = getByRole('button', {
        name: 'Apply Filters',
      });
      expect(applyButton).toBeDisabled();
    });
  });

  it('should call onClose with original filters when dialog backdrop is clicked', () => {
    const onClose = jest.fn();
    const originalFilters: Filters = {
      selectedDateRange: undefined,
      startDate: null,
      endDate: null,
      categories: [],
    };

    const { getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog
          {...defaultProps}
          onClose={onClose}
          selectedFilters={originalFilters}
        />
      </SnackbarProvider>,
    );

    // Click backdrop (this might need adjustment based on MUI implementation)
    const dialog = getByRole('dialog');
    userEvent.click(dialog.parentElement!);

    expect(onClose).toHaveBeenCalledWith(originalFilters);
  });

  it('should handle undefined selectedFilters', () => {
    const { getByLabelText, getByText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} selectedFilters={undefined} />
      </SnackbarProvider>,
    );

    expect(getByText('Report Settings')).toBeInTheDocument();
    expect(getByLabelText('Benefits')).not.toBeChecked();
  });

  it('should handle null categories in selectedFilters', () => {
    const selectedFilters: Filters = {
      selectedDateRange: undefined,
      startDate: null,
      endDate: null,
      categories: null,
    };

    const { getByLabelText } = render(
      <SnackbarProvider>
        <SettingsDialog {...defaultProps} selectedFilters={selectedFilters} />
      </SnackbarProvider>,
    );

    expect(getByLabelText('Benefits')).not.toBeChecked();
  });

  it('should keep Apply Filters button disabled and unclickable when startDate is later than endDate', async () => {
    const onClose = jest.fn();

    const { getByTestId, getByRole } = render(
      <SnackbarProvider>
        <SettingsDialog isOpen={true} onClose={onClose} />
      </SnackbarProvider>,
    );

    const startDateField = getByTestId('date-field-Start Date');
    const endDateField = getByTestId('date-field-End Date');

    userEvent.type(endDateField, '2025-01-01');
    userEvent.type(startDateField, '2025-01-31');

    expect(getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
  });
});
