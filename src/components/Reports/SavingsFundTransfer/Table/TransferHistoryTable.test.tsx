import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { UpdateRecurringTransferMutation } from '../TransferMutations.generated';
import { TransferHistory, mockData } from '../mockData';
import { TransferHistoryTable } from './TransferHistoryTable';

const mutationSpy = jest.fn();
const handleOpenMock = jest.fn();

const mockHistory: TransferHistory[] = [
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
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider<{
          updateRecurringTransfer: UpdateRecurringTransferMutation;
        }>
          onCall={mutationSpy}
        >
          <TransferHistoryTable
            history={mockHistory}
            emptyPlaceholder={<span>Empty Table</span>}
            handleOpenTransferModal={handleOpenMock}
          />
        </GqlMockedProvider>
      </LocalizationProvider>
    </ThemeProvider>
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
      <GqlMockedProvider onCall={mutationSpy}>
        <TransferHistoryTable
          history={[]}
          emptyPlaceholder={<span>Empty Table</span>}
          handleOpenTransferModal={handleOpenMock}
        />
      </GqlMockedProvider>,
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
});
