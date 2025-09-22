import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { StatusEnum, TableTypeEnum, mockData } from '../mockData';
import { PrintTable } from './PrintTable';

const mutationSpy = jest.fn();

const mockTransfers = [
  {
    ...mockData[0],
    transferFrom: 'Savings',
    transferTo: 'Primary',
    amount: 2500,
    status: StatusEnum.Complete,
    transferDate: DateTime.fromISO('2023-01-01'),
    endDate: null,
    note: 'Test transfer',
  },
];

const mockDefault = [
  {
    ...mockData[1],
    transferFrom: 'Conference',
    transferTo: 'Primary',
  },
];

describe('PrintTable', () => {
  it('renders the table with transfer data', async () => {
    const { getByRole, findByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <PrintTable
              transfers={mockTransfers}
              type={TableTypeEnum.History}
            />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(
      await findByRole('columnheader', { name: 'From' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Savings Account' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'To' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Primary Account' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Amount' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '$2,500.00' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Schedule' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'One Time' })).toBeInTheDocument();
    expect(
      await findByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: 'complete' })).toBeInTheDocument();
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

  it('renders default fund when no transfer provided', async () => {
    const { findByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <PrintTable transfers={mockDefault} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(
      await findByRole('cell', { name: 'Conference Savings Balance' }),
    ).toBeInTheDocument();
  });

  it('renders empty table message when no transfers are found', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <PrintTable transfers={[]} type={TableTypeEnum.History} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText('No transfer history available.')).toBeInTheDocument();
  });
});
