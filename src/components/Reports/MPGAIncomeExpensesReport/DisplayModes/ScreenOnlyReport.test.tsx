import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockData, months } from '../mockData';
import { ScreenOnlyReport } from './ScreenOnlyReport';

const mutationSpy = jest.fn();
const currency = 'USD';

const emptyData = {
  income: [{ ...mockData.income[0] }, { ...mockData.income[1] }],
  expenses: [],
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData}>
          <ScreenOnlyReport
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

describe('ScreenOnlyReport', () => {
  it('renders data correctly', () => {
    const { getByRole, queryAllByRole } = render(<TestComponent />);

    expect(queryAllByRole('grid')).toHaveLength(4);
    expect(
      getByRole('gridcell', { name: 'Contributions' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Staff Assessment' }),
    ).toBeInTheDocument();
  });

  it('displays the tables that should be showing', () => {
    const { queryAllByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <TotalsProvider data={emptyData}>
              <ScreenOnlyReport
                data={emptyData}
                last12Months={months}
                currency={currency}
              />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(queryAllByRole('grid')).toHaveLength(2);
  });
});
