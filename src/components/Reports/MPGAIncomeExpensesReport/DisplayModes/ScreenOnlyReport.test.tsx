import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsProvider } from '../TotalsContext/TotalsContext';
import { mockData } from '../mockData';
import { ScreenOnlyReport } from './ScreenOnlyReport';

const mutationSpy = jest.fn();
const currency = 'USD';

const data = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: [{ ...mockData.income[0] }, { ...mockData.income[1] }],
  ministryExpenses: [
    { ...mockData.ministryExpenses[0] },
    { ...mockData.ministryExpenses[1] },
  ],
  healthcareExpenses: [{ ...mockData.healthcareExpenses[0] }],
  misc: [{ ...mockData.misc[0] }, { ...mockData.misc[1] }],
  other: [{ ...mockData.other[0] }],
};

const expenseData = [
  { ...mockData.ministryExpenses[0] },
  { ...mockData.ministryExpenses[1] },
  { ...mockData.healthcareExpenses[0] },
  { ...mockData.misc[0] },
  { ...mockData.misc[1] },
  { ...mockData.other[0] },
];

const months = [
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
];

const emptyData = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: [],
  ministryExpenses: [],
  healthcareExpenses: [],
  misc: [],
  other: [],
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={data}>
          <ScreenOnlyReport
            data={data}
            last12Months={months}
            expenseData={expenseData}
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
  (window as any).ResizeObserver = jest
    .fn()
    .mockImplementation(resizeObserverMock);
});

describe('ScreenOnlyReport', () => {
  it('renders data correctly', () => {
    const { getByRole, queryAllByRole } = render(<TestComponent />);

    expect(queryAllByRole('grid')).toHaveLength(2);
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
                expenseData={expenseData}
                currency={currency}
              />
            </TotalsProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(queryAllByRole('grid')).toHaveLength(1);
  });
});
