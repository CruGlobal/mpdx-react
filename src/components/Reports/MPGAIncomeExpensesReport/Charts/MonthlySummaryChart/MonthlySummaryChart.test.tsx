import '../sharedRechartMock';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { TotalsProvider } from '../../TotalsContext/TotalsContext';
import { mockData, months } from '../../mockData';
import { MonthlySummaryChart } from './MonthlySummaryChart';

const mutationSpy = jest.fn();
const currency = 'USD';

interface TestComponentProps {
  loading?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ loading }) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <TotalsProvider data={mockData} loading={loading}>
          <MonthlySummaryChart
            incomeData={mockData.income}
            expenseData={mockData.expenses}
            months={months}
            aspect={1.35}
            width={100}
            currency={currency}
          />
        </TotalsProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('MonthlySummaryChart', () => {
  it('renders the bar chart', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() =>
      expect(region.querySelector('svg.recharts-surface')).toBeTruthy(),
    );
  });

  it('renders income and expense bars for each month', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const barShapes = region.querySelectorAll(
        '.recharts-bar-rectangle rect, .recharts-bar-rectangle path',
      );
      expect(barShapes.length).toBe(months.length * 2);
    });
  });

  it('renders the net difference above each month', async () => {
    const { findByRole } = render(<TestComponent />);

    const region = await findByRole('region');

    await waitFor(() => {
      const netLabels = Array.from(
        region.querySelectorAll('.recharts-label-list text'),
      ).map((node) => node.textContent);

      expect(netLabels).toEqual([
        '$5,809',
        '$5,236',
        '$4,755',
        '$5,351',
        '$6,894',
        '$5,664',
        '$5,956',
        '$7,026',
        '$7,713',
        '$7,312',
        '$9,579',
        '$16,588',
      ]);
    });
  });

  it('subtracts expenses from income, treating expenses as positive', async () => {
    const buildRow = (description: string, monthly: number[]) => ({
      id: description,
      description,
      monthly,
      average: 0,
      total: monthly.reduce((sum, value) => sum + value, 0),
    });

    const { findByRole } = render(
      <ThemeProvider theme={theme}>
        <TotalsProvider data={{ income: [], expenses: [] }}>
          <MonthlySummaryChart
            incomeData={[buildRow('Support', [100, 200])]}
            expenseData={[buildRow('Ministry', [0, 250])]}
            months={['Apr 2024', 'May 2024']}
            aspect={1.35}
            width={100}
            currency={currency}
          />
        </TotalsProvider>
      </ThemeProvider>,
    );

    const region = await findByRole('region');

    await waitFor(() => {
      const netLabels = Array.from(
        region.querySelectorAll('.recharts-label-list text'),
      ).map((node) => node.textContent);

      expect(netLabels).toEqual(['$100', '-$50']);
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

  it('renders a spinner instead of the chart while loading', () => {
    const { getByTestId, queryByRole } = render(<TestComponent loading />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByRole('region')).not.toBeInTheDocument();
  });
});
