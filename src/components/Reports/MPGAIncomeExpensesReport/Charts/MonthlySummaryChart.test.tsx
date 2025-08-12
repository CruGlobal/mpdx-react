import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MonthlySummaryChart } from './MonthlySummaryChart';

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

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <MonthlySummaryChart
          incomeData={mockData.income.data}
          expenseData={expenseData}
          months={months}
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

describe('MonthlySummaryChart', () => {
  it('renders the bar chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders the correct number of bars', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const barShapes = region.querySelectorAll(
        '.recharts-bar-rectangle rect, .recharts-bar-rectangle path',
      );
      expect(barShapes.length).toBe(months.length);
    });
  });

  it('renders legend with correct labels', async () => {
    const { findByRole } = render(<TestComponent />);

    const list = await findByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(within(list).getByText('Income')).toBeInTheDocument();
    expect(within(list).getByText('Expenses')).toBeInTheDocument();
  });

  it('displays x-axis labels correctly', async () => {
    const { container } = render(<TestComponent />);

    await waitFor(() => {
      const ticks = Array.from(
        container.querySelectorAll(
          '.recharts-cartesian-axis .recharts-cartesian-axis-tick tspan',
        ),
      ).map((n) => n.textContent);
      expect(ticks).toEqual(
        expect.arrayContaining([
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
          'Jan',
          'Feb',
          'Mar',
        ]),
      );
    });
  });
});
