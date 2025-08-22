import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockData, months } from '../mockData';
import { PrintOnlyReport } from './PrintOnlyReport';

const mutationSpy = jest.fn();
const currency = 'USD';

const emptyData = {
  income: [],
  expenses: [],
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData}>
          <PrintOnlyReport
            data={mockData}
            last12Months={months}
            currency={currency}
          />
        </TotalsProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

const resizeObserverMock = () => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
beforeAll(() => {
  window.ResizeObserver = jest.fn().mockImplementation(resizeObserverMock);
});

describe('PrintOnlyReport', () => {
  it('renders data correctly', () => {
    const { getByRole, getAllByRole } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Summary' })).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Expenses Categories' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Monthly Summary' }),
    ).toBeInTheDocument();

    expect(getAllByRole('table')).toHaveLength(2);
    expect(getByRole('cell', { name: 'Contributions' })).toBeInTheDocument();
    expect(getByRole('cell', { name: 'Staff Assessment' })).toBeInTheDocument();
  });

  it('displays the tables that should be showing', () => {
    const { queryAllByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TotalsProvider data={emptyData}>
              <PrintOnlyReport
                data={emptyData}
                last12Months={months}
                currency={currency}
              />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(queryAllByRole('table')).toHaveLength(2);
    expect(
      getByText(/no income data available in the last 12 months/i),
    ).toBeInTheDocument();
  });
});
