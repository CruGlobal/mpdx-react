import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SavingsFundTransferFailureReasonCode } from 'src/graphql/types.generated';
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
  recurringAmount: 15,
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
          failures: [],
        },
        summarizedTransfers: null,
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
          failures: [],
        },
        summarizedTransfers: null,
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
          failures: [],
        },
        summarizedTransfers: null,
      },
    ],
  ]),
  failures: [
    {
      occurrence: DateTime.fromISO('2023-08-15'),
      reasonCode: SavingsFundTransferFailureReasonCode.InsufficientFunds,
    },
  ],
};

const TestComponent: React.FC<{ transfer?: Transfers }> = ({
  transfer = mockTransfer,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FailedTransferModal handleClose={handleClose} transfer={transfer} />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const historyNote = 'Only the last year of transfer history is shown.';

describe('FailedTransferModal', () => {
  it('renders the modal', () => {
    const { getByText, getAllByRole, getByRole } = render(<TestComponent />);

    expect(getByText('Transfer History')).toBeInTheDocument();
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(getByText('Transfer Date')).toBeInTheDocument();
    expect(getByText('Status')).toBeInTheDocument();
    expect(getByText('Amount')).toBeInTheDocument();
    expect(getByText('Reason')).toBeInTheDocument();

    const button = getAllByRole('button', { name: 'Close' });
    expect(button[1]).toBeInTheDocument();
  });

  it('explains that only the last year of history is shown when the transfer started before the window', () => {
    const { getByText } = render(
      <TestComponent transfer={{ ...mockTransfer, historyTruncated: true }} />,
    );

    expect(getByText(historyNote)).toBeInTheDocument();
  });

  it('omits the history note when the whole transfer fits inside the window', () => {
    const { queryByText } = render(<TestComponent />);

    expect(queryByText(historyNote)).not.toBeInTheDocument();
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

  it('shows the reason for a failed month and leaves completed months blank', () => {
    const { getByRole } = render(<TestComponent />);

    const reasons = Array.from(
      getByRole('table').querySelectorAll('tbody tr'),
    ).map((row) => row.querySelectorAll('td')[3].textContent);
    expect(reasons).toEqual([
      '',
      '',
      'The fund did not have enough available balance.',
      '',
    ]);
  });

  it('shows the recurring transfer amount for a failed month', () => {
    const { getByRole } = render(<TestComponent />);

    const amounts = Array.from(
      getByRole('table').querySelectorAll('tbody tr'),
    ).map((row) => row.querySelectorAll('td')[0].textContent);
    expect(amounts).toEqual(['$10.00', '$10.00', '$15.00', '$10.00']);
  });

  it('shows a row and reason for each failed month', () => {
    const { getByRole, getByText } = render(
      <TestComponent
        transfer={{
          ...mockTransfer,
          summarizedTransfers: null,
          failures: [
            {
              occurrence: DateTime.fromISO('2023-12-15'),
              reasonCode: SavingsFundTransferFailureReasonCode.InactiveAccount,
            },
            {
              occurrence: DateTime.fromISO('2024-02-15'),
              reasonCode: SavingsFundTransferFailureReasonCode.NotAttempted,
            },
          ],
        }}
      />,
    );

    const rows = getByRole('table').querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelectorAll('td')[2].textContent).toBe('Dec 15, 2023');
    expect(rows[1].querySelectorAll('td')[2].textContent).toBe('Feb 15, 2024');
    expect(getByText('The staff account was inactive.')).toBeInTheDocument();
    expect(
      getByText('The retry window ended before it could go through.'),
    ).toBeInTheDocument();
  });

  it('keeps the HR contact footer', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'HR@cru.org' })).toHaveAttribute(
      'href',
      'mailto:HR@cru.org',
    );
  });
});
