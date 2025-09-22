import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { UpdateRecurringTransferMutation } from '../TransferMutations.generated';
import { TableTypeEnum, Transfers, mockData } from '../mockData';
import { TransfersTable } from './TransfersTable';

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

const TestComponent: React.FC = () => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider<{
            updateRecurringTransfer: UpdateRecurringTransferMutation;
          }>
            onCall={mutationSpy}
          >
            <TransfersTable
              history={mockHistory}
              type={TableTypeEnum.History}
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

    const iconRow = getByRole('row', {
      name: 'Savings Account Arrow Primary Account $2,500.00 One Time pending Sep 26, 2023 Reimbursements Stop Transfer',
    });
    const cells = within(iconRow).getAllByRole('gridcell');

    const transferIconCell = cells[0];
    const statusCell = cells[3];
    const actionCell = cells[7];

    expect(
      await findByRole('columnheader', { name: 'Transfers' }),
    ).toBeInTheDocument();
    expect(
      within(transferIconCell).getByRole('img', { name: 'Primary Account' }),
    ).toBeInTheDocument();
    expect(
      within(transferIconCell).getByRole('img', { name: 'Savings Account' }),
    ).toBeInTheDocument();
    expect(
      within(transferIconCell).getByRole('img', { name: 'Arrow' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('columnheader', { name: 'Amount' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '$2,500.00' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Schedule' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'One Time' })).toBeInTheDocument();

    expect(
      await findByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
    expect(within(statusCell).getByText('pending')).toBeInTheDocument();

    expect(
      await findByRole('columnheader', { name: 'Transfer Date' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Sep 26, 2023' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Stop Date' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Note' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Reimbursements' }),
    ).toBeInTheDocument();

    expect(
      await findByRole('columnheader', { name: 'Actions' }),
    ).toBeInTheDocument();
    expect(
      within(actionCell).getByRole('button', { name: 'Add Stop Date' }),
    ).toBeInTheDocument();
    expect(
      within(actionCell).getByRole('img', { name: 'Stop Transfer' }),
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
    const { getAllByRole, getByRole, findByRole } = render(<TestComponent />);

    const amountHeader = getByRole('columnheader', { name: 'Amount' });
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

  describe('Calendar', () => {
    it('opens the calendar when Add Stop Date is clicked', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      const iconRow = getByRole('row', {
        name: 'Savings Account Arrow Primary Account $2,500.00 One Time pending Sep 26, 2023 Reimbursements Stop Transfer',
      });
      const cells = within(iconRow).getAllByRole('gridcell');
      const actionCell = cells[7];
      const icon = within(actionCell).getByRole('button', {
        name: 'Add Stop Date',
      });

      userEvent.click(icon);

      const dialog = await findByRole('dialog');
      expect(dialog).toBeVisible();
    });

    it('closes the calendar when Cancel is clicked', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      const iconRow = getByRole('row', {
        name: 'Savings Account Arrow Primary Account $2,500.00 One Time pending Sep 26, 2023 Reimbursements Stop Transfer',
      });
      const cells = within(iconRow).getAllByRole('gridcell');
      const actionCell = cells[7];
      const icon = within(actionCell).getByRole('button', {
        name: 'Add Stop Date',
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

  it('updates end date when Ok is clicked', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const iconRow = getByRole('row', {
      name: 'Primary Account Arrow Savings Account $1,200.00 Monthly ongoing Sep 25, 2023 Sep 25, 2025 Long-term savings Stop Transfer',
    });
    const cells = within(iconRow).getAllByRole('gridcell');
    const actionCell = cells[7];
    const icon = within(actionCell).getByRole('button', {
      name: 'Edit Stop Date',
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

    await userEvent.click(button!);

    const acceptButton = within(dialog).getByRole('button', { name: /ok/i });
    await userEvent.click(acceptButton);

    expect(mutationSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Stop date updated successfully',
        {
          variant: 'success',
        },
      );
    });
  });
});
