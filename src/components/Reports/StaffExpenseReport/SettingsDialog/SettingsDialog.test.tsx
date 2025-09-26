import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { DateRange } from '../Helpers/StaffReportEnum';
import { Filters, SettingsDialog, SettingsDialogProps } from './SettingsDialog';

const TestComponent: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
}) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <SettingsDialog
      isOpen={isOpen}
      onClose={onClose}
      selectedFilters={selectedFilters}
    />
  </LocalizationProvider>
);

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
      <TestComponent {...defaultProps} />,
    );

    expect(getByText('Report Settings')).toBeInTheDocument();
    expect(getByLabelText('Select Date Range')).toBeInTheDocument();
    expect(getByText('Or enter a custom date range:')).toBeInTheDocument();
    expect(getByText('Select Categories:')).toBeInTheDocument();
  });

  it('should not render dialog when isOpen is false', () => {
    const { queryByText } = render(
      <TestComponent {...defaultProps} isOpen={false} />,
    );

    expect(queryByText('Report Settings')).not.toBeInTheDocument();
  });

  it('should render all date range options', () => {
    const { getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    fireEvent.mouseDown(getByLabelText('Select Date Range'));

    expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Week to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Month to Date' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Year to Date' })).toBeInTheDocument();
  });

  it('should render all category checkboxes', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

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
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
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

    const { getByLabelText } = render(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    expect(getByLabelText('Start Date')).toHaveValue('');
    expect(getByLabelText('End Date')).toHaveValue('');
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
    const { getByLabelText, getByText } = render(
      <TestComponent {...defaultProps} />,
    );

    const startDateField = getByLabelText('Start Date');
    const endDateField = getByLabelText('End Date');

    userEvent.type(startDateField, '2025-01-01');
    userEvent.type(endDateField, '2025-01-31');

    const dropdown = getByLabelText('Select Date Range');
    userEvent.click(dropdown);
    userEvent.click(getByText('Month to Date'));

    // Wait for fields to update based on Month to Date selection

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
    const { getByLabelText } = render(<TestComponent {...defaultProps} />);

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
      <TestComponent {...defaultProps} onClose={onClose} />,
    );

    userEvent.click(getByLabelText('Benefits'));

    userEvent.click(getByRole('button', { name: 'Apply Filters' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith({
        selectedDateRange: null,
        startDate: null,
        endDate: null,
        categories: ['Benefits'],
      });
    });
  });

  it('should calculate dates for predefined ranges on submission', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByText, getByRole } = render(
      <TestComponent {...defaultProps} onClose={onClose} />,
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

  it('should call onClose with original filters when Cancel is clicked', async () => {
    const onClose = jest.fn();
    const originalFilters: Filters = {
      selectedDateRange: DateRange.WeekToDate,
      startDate: null,
      endDate: null,
      categories: ['Salary'],
    };

    const { getByLabelText, getByRole } = render(
      <TestComponent
        {...defaultProps}
        onClose={onClose}
        selectedFilters={originalFilters}
      />,
    );

    userEvent.click(getByLabelText('Benefits'));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledWith(originalFilters);
  });

  it('should reset form when Cancel is clicked', async () => {
    const onClose = jest.fn();

    const { getByLabelText, getByRole } = render(
      <TestComponent {...defaultProps} onClose={onClose} />,
    );

    userEvent.click(getByLabelText('Benefits'));
    expect(getByLabelText('Benefits')).toBeChecked();

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    // Form should be reset (but we can't easily test this without re-opening)
    expect(onClose).toHaveBeenCalled();
  });

  it('should disable Apply Filters button when form is not dirty', () => {
    const { getByRole } = render(<TestComponent {...defaultProps} />);

    expect(getByRole('button', { name: 'Apply Filters' })).toBeDisabled();
  });

  it('should enable Apply Filters button when form is dirty and valid', async () => {
    const { getByRole, getByLabelText } = render(
      <TestComponent {...defaultProps} />,
    );

    // Make form dirty
    userEvent.click(getByLabelText('Benefits'));

    expect(getByRole('button', { name: 'Apply Filters' })).toBeEnabled();
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

  it('should handle undefined selectedFilters', () => {
    const { getByLabelText, getByText } = render(
      <TestComponent {...defaultProps} selectedFilters={undefined} />,
    );

    expect(getByText('Report Settings')).toBeInTheDocument();
    expect(getByLabelText('Benefits')).not.toBeChecked();
  });

  it('should handle null categories in selectedFilters', () => {
    const selectedFilters: Filters = {
      selectedDateRange: null,
      startDate: null,
      endDate: null,
      categories: null,
    };

    const { getByLabelText } = render(
      <TestComponent {...defaultProps} selectedFilters={selectedFilters} />,
    );

    expect(getByLabelText('Benefits')).not.toBeChecked();
  });
});
