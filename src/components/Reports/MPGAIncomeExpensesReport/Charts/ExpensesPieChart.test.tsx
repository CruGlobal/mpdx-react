import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ExpensesPieChart } from './ExpensesPieChart';

const mutationSpy = jest.fn();

const mockData = {
  accountListId: '12345',
  accountName: 'Test Account',
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
        <ExpensesPieChart
          ministryExpenses={ministryTotal}
          healthcareExpenses={healthcareTotal}
          misc={miscTotal}
          other={otherTotal}
          aspect={1.35}
          width={100}
        />
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

jest.mock('recharts', () => {
  const Original = jest.requireActual('recharts');

  const MockResponsiveContainer = ({ height, aspect, children }) => {
    const w = 800;
    const h =
      typeof height === 'number'
        ? height
        : aspect
        ? Math.round(w / aspect)
        : 400;
    return React.createElement(
      'div',
      {
        className: 'recharts-responsive-container',
        style: { width: w, height: h },
      },
      React.cloneElement(React.Children.only(children), {
        width: w,
        height: h,
      }),
    );
  };

  return { ...Original, ResponsiveContainer: MockResponsiveContainer };
});

describe('ExpensesPieChart', () => {
  it('render pie chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders four slices', async () => {
    const { findByRole } = render(<TestComponent />);
    const region = await findByRole('region');

    await waitFor(() => {
      const sectors = region.querySelectorAll('.recharts-pie-sector path');
      expect(sectors.length).toBe(4);
    });
  });

  it('shows legend items', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('shows the legend labels', async () => {
    const { getByText, findByText } = render(<TestComponent />);

    expect(await findByText('Ministry')).toBeInTheDocument();
    expect(getByText('Healthcare')).toBeInTheDocument();
    expect(getByText('Miscellaneous')).toBeInTheDocument();
    expect(getByText('Assessment, Benefits, Salary')).toBeInTheDocument();
  });
});
