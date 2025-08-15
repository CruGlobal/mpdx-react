import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { PrintOnlyReport } from './PrintOnlyReport';

const mutationSpy = jest.fn();

const mockData = {
  accountListId: '12345',
  accountName: 'Test Account',
  income: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'Contributions',
        monthly: [
          6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
          19215,
        ],
        average: 9013,
        total: 108156,
      },
      {
        id: crypto.randomUUID(),
        description: 'Fr Andre, Fre to Mouna Ghar',
        monthly: [100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0],
        average: 58,
        total: 700,
      },
    ],
  },
  ministryExpenses: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'Supplies and Materials',
        monthly: [0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 17,
        total: 200,
      },
      {
        id: crypto.randomUUID(),
        description: 'Business Auto Mileage',
        monthly: [0, 0, 0, 0, 0, 0, 565, 0, 488, 253, 818, 0],
        average: 177,
        total: 2124,
      },
    ],
  },
  healthcareExpenses: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'Single/Husband/Widow EOBs',
        monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
        average: 161,
        total: 1933,
      },
    ],
  },
  misc: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'AUGUST 2024',
        monthly: [26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        average: 2,
        total: 26,
      },
      {
        id: crypto.randomUUID(),
        description: 'Charge(s) for Credit Card gift(s)',
        monthly: [23, 23, 23, 45, 22, 22, 28, 24, 28, 29, 186, 55],
        average: 42,
        total: 507,
      },
    ],
  },
  other: {
    data: [
      {
        id: crypto.randomUUID(),
        description: 'Staff Assessment',
        monthly: [
          812, 731, 692, 883, 964, 789, 907, 989, 1176, 1227, 2237, 2372,
        ],
        average: 1148,
        total: 13779,
      },
    ],
  },
};

const expenseData = [
  {
    id: crypto.randomUUID(),
    description: 'Supplies and Materials',
    monthly: [0, 0, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    average: 17,
    total: 200,
  },
  {
    id: crypto.randomUUID(),
    description: 'Business Auto Mileage',
    monthly: [0, 0, 0, 0, 0, 0, 565, 0, 488, 253, 818, 0],
    average: 177,
    total: 2124,
  },
  {
    id: crypto.randomUUID(),
    description: 'Single/Husband/Widow EOBs',
    monthly: [0, 0, 0, 976, 55, 0, 0, 0, 194, 708, 0, 0],
    average: 161,
    total: 1933,
  },
  {
    id: crypto.randomUUID(),
    description: 'AUGUST 2024',
    monthly: [26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    average: 2,
    total: 26,
  },
  {
    id: crypto.randomUUID(),
    description: 'Charge(s) for Credit Card gift(s)',
    monthly: [23, 23, 23, 45, 22, 22, 28, 24, 28, 29, 186, 55],
    average: 42,
    total: 507,
  },
  {
    id: crypto.randomUUID(),
    description: 'Staff Assessment',
    monthly: [812, 731, 692, 883, 964, 789, 907, 989, 1176, 1227, 2237, 2372],
    average: 1148,
    total: 13779,
  },
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

const incomeTotal = mockData.income.data.reduce(
  (acc, item) => acc + item.total,
  0,
);
const expensesTotal = mockData.ministryExpenses.data.reduce(
  (acc, item) => acc + item.total,
  0,
);
const ministryTotal = mockData.ministryExpenses.data.reduce(
  (acc, item) => acc + item.total,
  0,
);
const healthcareTotal = mockData.healthcareExpenses.data.reduce(
  (acc, item) => acc + item.total,
  0,
);
const miscTotal = mockData.misc.data.reduce((acc, item) => acc + item.total, 0);
const otherTotal = mockData.other.data.reduce(
  (acc, item) => acc + item.total,
  0,
);

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <PrintOnlyReport
          data={mockData}
          incomeTotal={incomeTotal}
          expensesTotal={expensesTotal}
          ministryTotal={ministryTotal}
          healthcareTotal={healthcareTotal}
          miscTotal={miscTotal}
          otherTotal={otherTotal}
          last12Months={months}
          expenseData={expenseData}
        />
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
});
