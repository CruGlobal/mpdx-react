import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SavingsFundTransferFailureReasonCode } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  ScheduleEnum,
  StatusEnum,
  TableTypeEnum,
  TransferTypeEnum,
  Transfers,
  mockData,
} from '../mockData';
import { CreateTransferRows, TransfersTable } from './TransfersTable';

const mutationSpy = jest.fn();
const handleOpenMock = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

jest.mock('../DeleteTransferModal/DynamicDeleteTransferModal', () => ({
  DynamicDeleteTransferModal: () => <div data-testid="delete-modal" />,
}));

jest.mock('../FailedTransferModal/DynamicFailedTransferModal', () => ({
  DynamicFailedTransferModal: () => <div data-testid="failed-modal" />,
}));

const mockHistory: Transfers[] = [
  {
    ...mockData[0],
    transferFrom: 'Savings',
    transferTo: 'Primary',
  },
  {
    ...mockData[1],
    transferFrom: 'Primary',
    transferTo: 'Savings',
  },
];

interface TestComponentProps {
  history?: Transfers[];
  type?: TableTypeEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  history = mockHistory,
  type = TableTypeEnum.History,
}) => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TransfersTable
              history={history}
              type={type}
              emptyPlaceholder={<span>Empty Table</span>}
              handleOpenTransferModal={handleOpenMock}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('TransferHistoryTable', () => {
  it('renders with transfer history data', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const grid = await findByRole('grid');
    const headers = within(grid)
      .getAllByRole('columnheader')
      .map((h) => h.textContent);
    expect(headers).toEqual(
      expect.arrayContaining([
        'Transfers',
        'Amount',
        'Schedule',
        'Status',
        'Start Date',
        'Next Payment Date',
        'End Date',
        'Note',
        'Actions',
      ]),
    );

    const rows = within(grid).getAllByRole('row');
    const iconRow = rows[1];
    const cells = within(iconRow).getAllByRole('gridcell');

    const transferIconCell = cells[0];
    const statusCell = cells[3];
    const actionCell = cells[8];

    expect(
      within(transferIconCell).getByRole('img', { name: 'Primary Account' }),
    ).toBeInTheDocument();
    expect(
      within(transferIconCell).getByRole('img', { name: 'Savings Account' }),
    ).toBeInTheDocument();
    expect(
      within(transferIconCell).getByRole('img', { name: 'Arrow' }),
    ).toBeInTheDocument();

    expect(getByRole('gridcell', { name: '$2,500.00' })).toBeInTheDocument();

    expect(getByRole('gridcell', { name: 'One Time' })).toBeInTheDocument();

    expect(within(statusCell).getByText('pending')).toBeInTheDocument();

    expect(getByRole('gridcell', { name: 'Sep 26, 2023' })).toBeInTheDocument();

    // A one-time transfer has neither a next payment nor an end date.
    expect(cells[5].textContent).toBe('');
    expect(cells[6].textContent).toBe('');

    expect(
      getByRole('gridcell', { name: 'Reimbursements' }),
    ).toBeInTheDocument();

    expect(
      within(actionCell).getByRole('button', { name: 'Add End Date' }),
    ).toBeInTheDocument();
    expect(
      within(actionCell).getByRole('button', { name: 'Stop Transfer' }),
    ).toBeInTheDocument();
  });

  it('renders empty table when no transfer history is found', async () => {
    const { findByText } = render(
      <SnackbarProvider>
        <GqlMockedProvider onCall={mutationSpy}>
          <TransfersTable
            history={[]}
            type={TableTypeEnum.History}
            emptyPlaceholder={<span>Empty Table</span>}
            handleOpenTransferModal={handleOpenMock}
          />
        </GqlMockedProvider>
        ,
      </SnackbarProvider>,
    );

    expect(await findByText('Empty Table')).toBeInTheDocument();
  });

  it('updates the sort order', async () => {
    const { getAllByRole, findByRole } = render(<TestComponent />);

    const amountHeader = await findByRole('columnheader', { name: 'Amount' });
    expect(
      within(amountHeader).getByTestId('ArrowDownwardIcon'),
    ).toBeInTheDocument();

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const ascCells = getAllByRole('gridcell', { name: /\$\d+/ });
    expect(ascCells[0]).toHaveTextContent('$2,500.00');
    expect(ascCells[1]).toHaveTextContent('$1,200.00');

    userEvent.click(await findByRole('columnheader', { name: 'Amount' }));
    const descCells = getAllByRole('gridcell', { name: /\$\d+/ });
    expect(descCells[0]).toHaveTextContent('$1,200.00');
    expect(descCells[1]).toHaveTextContent('$2,500.00');
  });

  it('sorts the Transfers column by the derived fund-pair label', async () => {
    const { getAllByRole, findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('columnheader', { name: 'Transfers' }));
    const descCells = getAllByRole('gridcell', { name: /\$\d+/ });
    expect(descCells[0]).toHaveTextContent('$2,500.00');
    expect(descCells[1]).toHaveTextContent('$1,200.00');

    userEvent.click(await findByRole('columnheader', { name: 'Transfers' }));
    const ascCells = getAllByRole('gridcell', { name: /\$\d+/ });
    expect(ascCells[0]).toHaveTextContent('$1,200.00');
    expect(ascCells[1]).toHaveTextContent('$2,500.00');
  });

  describe('Calendar', () => {
    it('opens the calendar when Add End Date is clicked', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      const iconRow = getByRole('row', {
        name: 'Savings Account Arrow Primary Account $2,500.00 One Time pending Sep 26, 2023 Reimbursements',
      });
      const cells = within(iconRow).getAllByRole('gridcell');
      const actionCell = cells[8];
      const icon = within(actionCell).getByRole('button', {
        name: 'Add End Date',
      });

      userEvent.click(icon);

      const dialog = await findByRole('dialog');
      expect(dialog).toBeVisible();
    });

    it('close calendar when Cancel is clicked', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      const iconRow = getByRole('row', {
        name: 'Savings Account Arrow Primary Account $2,500.00 One Time pending Sep 26, 2023 Reimbursements',
      });
      const cells = within(iconRow).getAllByRole('gridcell');
      const actionCell = cells[8];
      const icon = within(actionCell).getByRole('button', {
        name: 'Add End Date',
      });

      userEvent.click(icon);

      const dialog = await findByRole('dialog');
      expect(dialog).toBeVisible();

      const cancelButton = within(dialog).getByRole('button', {
        name: 'Cancel',
      });
      userEvent.click(cancelButton);

      expect(dialog).not.toBeVisible();
    });
  });

  it('opens modal when Clear is clicked and updates when confirmed', async () => {
    const { getByRole, findByRole, findByText } = render(<TestComponent />);

    const iconRow = getByRole('row', {
      name: 'Primary Account Arrow Savings Account $1,200.00 Monthly ongoing Sep 25, 2023 Sep 25, 2025 Long-term savings',
    });
    const cells = within(iconRow).getAllByRole('gridcell');
    const actionCell = cells[8];
    const icon = within(actionCell).getByRole('button', {
      name: 'Edit End Date',
    });

    userEvent.click(icon);

    const dialog = await findByRole('dialog');
    expect(dialog).toBeVisible();

    userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));

    expect(await findByText('Confirm Clear')).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => expect(mutationSpy).toHaveBeenCalled());
    expect(mockEnqueue).toHaveBeenCalledWith('End date updated successfully', {
      variant: 'success',
    });

    expect(dialog).not.toBeVisible();
  }, 30000);

  it('updates end date when Ok is clicked', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const iconRow = getByRole('row', {
      name: 'Primary Account Arrow Savings Account $1,200.00 Monthly ongoing Sep 25, 2023 Sep 25, 2025 Long-term savings',
    });
    const cells = within(iconRow).getAllByRole('gridcell');
    const actionCell = cells[8];
    const icon = within(actionCell).getByRole('button', {
      name: 'Edit End Date',
    });

    userEvent.click(icon);

    const dialog = await findByRole('dialog');
    expect(dialog).toBeVisible();

    await within(dialog).findByRole('grid');

    const candidates = within(dialog).getAllByText(/^30$/, {
      selector: 'button',
    });

    const button = candidates.find(
      (b) => !b.className.includes('MuiPickersDay-dayOutsideMonth'),
    );
    expect(button).toBeTruthy();

    userEvent.click(button!);

    const acceptButton = within(dialog).getByRole('button', { name: /ok/i });
    userEvent.click(acceptButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateRecurringTransfer', {
        recurringEnd: '2025-09-30',
      }),
    );
    expect(mockEnqueue).toHaveBeenCalledWith('End date updated successfully', {
      variant: 'success',
    });
  });

  describe('date columns', () => {
    const nextPaymentCell = (container: HTMLElement) =>
      container.querySelector('[role="gridcell"][data-field="nextPaymentDate"]')
        ?.textContent;

    // The global test setup pins the clock to 2020-01-01.
    const ongoingRecurring: Transfers = {
      ...mockData[1],
      schedule: ScheduleEnum.Monthly,
      status: StatusEnum.Ongoing,
      transferDate: DateTime.fromISO('2019-10-15T00:00:00+00:00', {
        setZone: true,
      }),
      endDate: null,
    };

    it('shows the start date and the next payment date of a recurring transfer', async () => {
      const { findByText, getByText } = render(
        <TestComponent history={[ongoingRecurring]} />,
      );

      expect(await findByText('Oct 15, 2019')).toBeInTheDocument();
      expect(getByText('Jan 15, 2020')).toBeInTheDocument();
    });

    it('shows only the start date once the recurring transfer has ended', async () => {
      const { container, findByText } = render(
        <TestComponent
          history={[
            {
              ...ongoingRecurring,
              status: StatusEnum.Ended,
              endDate: DateTime.local(2019, 12, 15),
            },
          ]}
        />,
      );

      expect(await findByText('Oct 15, 2019')).toBeInTheDocument();
      expect(nextPaymentCell(container)).toBe('');
    });

    it('shows only the transfer date of a one-time transfer', async () => {
      const { container, findByText } = render(
        <TestComponent
          history={[
            {
              ...mockData[0],
              transferDate: DateTime.fromISO('2019-10-15T00:00:00+00:00', {
                setZone: true,
              }),
            },
          ]}
        />,
      );

      expect(await findByText('Oct 15, 2019')).toBeInTheDocument();
      expect(nextPaymentCell(container)).toBe('');
    });
  });

  describe('CreateTransferRows', () => {
    it('carries the truncated-history flag through to the row the failed modal reads', () => {
      const row = CreateTransferRows({
        ...mockHistory[0],
        historyTruncated: true,
      });

      expect(row.historyTruncated).toBe(true);
    });

    it('carries the API failures through to the row the failed modal reads', () => {
      const failures = [
        {
          occurrence: DateTime.fromISO('2023-12-15'),
          reasonCode: SavingsFundTransferFailureReasonCode.InsufficientFunds,
        },
      ];
      const row = CreateTransferRows({ ...mockHistory[1], failures });

      expect(row.failures).toEqual(failures);
      expect(CreateTransferRows(mockHistory[1]).failures).toBeNull();
    });
  });

  it('opens the failed transfer modal for a row with failures and no completed transfers', async () => {
    const { findByRole, findByTestId, getByText } = render(
      <TestComponent
        history={[
          {
            ...mockHistory[1],
            amount: 0,
            summarizedTransfers: new Map(),
            failures: [
              {
                occurrence: DateTime.fromISO('2023-12-15'),
                reasonCode:
                  SavingsFundTransferFailureReasonCode.InsufficientFunds,
              },
              {
                occurrence: DateTime.fromISO('2024-02-15'),
                reasonCode: SavingsFundTransferFailureReasonCode.NotAttempted,
              },
            ],
          },
        ]}
      />,
    );

    const failedButton = await findByRole('button', {
      name: 'Failed Transfers',
    });
    const badge = failedButton.closest<HTMLElement>('.MuiBadge-root')!;
    expect(within(badge).getByText('2')).toBeInTheDocument();

    userEvent.click(failedButton);
    expect(await findByTestId('failed-modal')).toBeInTheDocument();
    expect(getByText('$0.00')).toBeInTheDocument();
  });

  describe('action buttons', () => {
    it('opens the stop modal when the Stop Transfer button is tapped outside the icon', async () => {
      const { findAllByRole, findByTestId } = render(<TestComponent />);

      const [stopButton] = await findAllByRole('button', {
        name: 'Stop Transfer',
      });
      userEvent.click(stopButton);

      expect(await findByTestId('delete-modal')).toBeInTheDocument();
    });

    it('opens the stop modal from the keyboard', async () => {
      const { findAllByRole, findByTestId } = render(<TestComponent />);

      const [stopButton] = await findAllByRole('button', {
        name: 'Stop Transfer',
      });
      stopButton.focus();
      userEvent.keyboard('{Enter}');

      expect(await findByTestId('delete-modal')).toBeInTheDocument();
    });

    it('opens the edit modal and the cancel modal for an upcoming transfer', async () => {
      const { findAllByRole, getAllByRole, findByTestId } = render(
        <TestComponent type={TableTypeEnum.Upcoming} />,
      );

      const [editButton] = await findAllByRole('button', { name: 'Edit' });
      userEvent.click(editButton);
      expect(handleOpenMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: TransferTypeEnum.Edit }),
      );

      userEvent.click(getAllByRole('button', { name: 'Cancel Transfer' })[0]);
      expect(await findByTestId('delete-modal')).toBeInTheDocument();
    });
  });
});
