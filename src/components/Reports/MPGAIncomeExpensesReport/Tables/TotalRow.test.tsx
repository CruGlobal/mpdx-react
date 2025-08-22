import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { TotalRow } from './TotalRow';

const mutationSpy = jest.fn();

const data = {
  income: [{ ...mockData.income[0] }, { ...mockData.income[1] }],
  expenses: [{ ...mockData.income[2] }],
};
const overallTotal = 108_856;

describe('TotalRow', () => {
  it('renders correctly', async () => {
    const { getByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TotalRow data={data.income} overallTotal={overallTotal} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByRole('grid')).toBeInTheDocument();
    expect(getByText('Overall Total')).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '108,856' })).toBeInTheDocument();
  });

  it('should display - when no data available', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TotalRow data={data.expenses} overallTotal={0} />
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    const grid = getByRole('grid');
    expect(within(grid).getAllByText('-')).toHaveLength(14);
  });
});
