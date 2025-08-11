import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ScheduleEnum, StatusEnum } from '../mockData';
import { PrintTable } from './PrintTable';

const mutationSpy = jest.fn();

const mockTransfers = [
  {
    id: '1',
    transferFrom: 'staffSavings',
    transferTo: 'staffAccount',
    amount: 1000,
    schedule: ScheduleEnum.OneTime,
    status: StatusEnum.Ongoing,
    transferDate: DateTime.fromISO('2023-01-01'),
    endDate: null,
    note: 'Test transfer',
    actions: 'edit-delete',
  },
];

describe('PrintTable', () => {
  it('renders the table with transfer data', async () => {
    const { getByRole, findByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <PrintTable transfers={mockTransfers} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(
      await findByRole('columnheader', { name: 'From' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Staff Savings' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'To' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Staff Account' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Amount' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$1,000.00' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Schedule' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'One Time' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Completed' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Transfer Date' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Jan 1, 2023' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Stop Date' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Note' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Test transfer' })).toBeInTheDocument();
  });

  it('renders empty table message when no transfers are found', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <PrintTable transfers={[]} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText('No transfer history available.')).toBeInTheDocument();
  });
});
