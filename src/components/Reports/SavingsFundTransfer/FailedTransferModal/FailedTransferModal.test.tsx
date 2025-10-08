import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import theme from 'src/theme';
import { ScheduleEnum, StatusEnum, Transfers } from '../mockData';
import { FailedTransferModal } from './FailedTransferModal';

const handleClose = jest.fn();

const mockTransfer: Transfers = {
  id: '1',
  transferFrom: 'Primary',
  transferTo: 'Savings',
  amount: 30,
  schedule: ScheduleEnum.Monthly,
  status: StatusEnum.Ongoing,
  transferDate: DateTime.fromISO('2023-06-15'),
  endDate: DateTime.fromISO('2023-09-15'),
  note: 'Test transfer',
  actions: 'edit-delete',
  recurringId: '1',
  baseAmount: 10,
  failedCount: 1,
  summarizedTransfers: new Map([
    [
      '2',
      {
        transaction: {
          id: '2',
          amount: 10,
          description: null,
          transactedAt: DateTime.fromISO('2023-06-15'),
        },
        subCategory: { id: '1', name: 'deposit' },
        transfer: {
          sourceFundTypeName: 'Primary',
          destinationFundTypeName: 'Savings',
        },
        recurringTransfer: {
          id: '1',
          amount: 10,
          recurringStart: DateTime.fromISO('2023-06-15'),
          recurringEnd: DateTime.fromISO('2023-09-15'),
          active: true,
        },
        baseAmount: 10,
        failedCount: 0,
        summarizedTransfers: null,
        missingMonths: null,
      },
    ],
    [
      '3',
      {
        transaction: {
          id: '3',
          amount: 10,
          description: null,
          transactedAt: DateTime.fromISO('2023-07-15'),
        },
        subCategory: { id: '1', name: 'deposit' },
        transfer: {
          sourceFundTypeName: 'Primary',
          destinationFundTypeName: 'Savings',
        },
        recurringTransfer: {
          id: '1',
          amount: 10,
          recurringStart: DateTime.fromISO('2023-06-15'),
          recurringEnd: DateTime.fromISO('2023-09-15'),
          active: true,
        },
        baseAmount: 10,
        failedCount: 0,
        summarizedTransfers: null,
        missingMonths: null,
      },
    ],
    [
      '4',
      {
        transaction: {
          id: '4',
          amount: 10,
          description: null,
          transactedAt: DateTime.fromISO('2023-09-15'),
        },
        subCategory: { id: '1', name: 'deposit' },
        transfer: {
          sourceFundTypeName: 'Primary',
          destinationFundTypeName: 'Savings',
        },
        recurringTransfer: {
          id: '1',
          amount: 10,
          recurringStart: DateTime.fromISO('2023-06-15'),
          recurringEnd: DateTime.fromISO('2023-09-15'),
          active: true,
        },
        baseAmount: 10,
        failedCount: 0,
        summarizedTransfers: null,
        missingMonths: null,
      },
    ],
  ]),
  missingMonths: [DateTime.fromISO('2023-08-15')],
};

const TestComponent: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FailedTransferModal
          handleClose={handleClose}
          transfer={mockTransfer}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

describe('FailedTransferModal', () => {
  it('renders the modal', () => {
    const { getByText, getAllByRole, getByRole } = render(<TestComponent />);

    expect(getByText('Transfer History')).toBeInTheDocument();
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(getByText('Transfer Date')).toBeInTheDocument();
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();

    const button = getAllByRole('button', { name: 'Close' });
    expect(button[1]).toBeInTheDocument();
  });

  it('renders the correct number of transfer rows', () => {
    const { getByRole } = render(<TestComponent />);

    const rows = getByRole('table').querySelectorAll('tbody tr');
    expect(rows.length).toBe(4);
  });

  it('should sort the transfers by date ascending', () => {
    const { getByRole } = render(<TestComponent />);

    const rows = getByRole('table').querySelectorAll('tbody tr');
    const firstRowDate = rows[0].querySelectorAll('td')[2].textContent;
    const secondRowDate = rows[1].querySelectorAll('td')[2].textContent;
    const thirdRowDate = rows[2].querySelectorAll('td')[2].textContent;
    const fourthRowDate = rows[3].querySelectorAll('td')[2].textContent;

    expect(firstRowDate).toBe('Jun 15, 2023');
    expect(secondRowDate).toBe('Jul 15, 2023');
    expect(thirdRowDate).toBe('Aug 15, 2023');
    expect(fourthRowDate).toBe('Sep 15, 2023');
  });

  it('closes the modal on close button click', () => {
    const { getAllByRole } = render(<TestComponent />);

    const button = getAllByRole('button', { name: 'Close' });
    userEvent.click(button[1]);
    expect(handleClose).toHaveBeenCalled();
  });
});
